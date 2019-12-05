from flask import Flask, flash, request, redirect, url_for
from flask import render_template, jsonify
from werkzeug.utils import secure_filename

import pandas as pd
import redis
import io
import ujson
import collections

import scipy.stats as stats
import numpy as np

app = Flask(__name__)

ALLOWED_EXTENSIONS = {'txt', 'csv'}

r = redis.Redis(host='localhost', port=6379, db=0)


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/upload', methods=['GET', 'POST'])
def upload():
    if request.method == 'POST':
        print("Let's do an upload!")
        # check if the post request has the file part
        print(request.files)
        if 'file' not in request.files:
            flash('No file part')
            print("We lack a file element")
            return redirect(request.url)
        file = request.files['file']
        # if user does not select file, browser also
        # submit an empty part without filename
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)

        if file and allowed_file(file.filename):
            print("this is allowed file")
            filename = secure_filename(file.filename)
            file_contents = file.read()
            data = file_contents.decode("ascii")
            print(data)
            df = pd.read_csv(io.StringIO(data), delimiter=',', header='infer')

            r.sadd("experiments", filename)
            r.set(filename, data)

            # Average, median, STD, MAD
            r.set(filename+"_statistics", df['score'].describe().to_json())
            print("Did everything!")
            print(request.url)
            return redirect(url_for('upload', filename=filename))
            #return redirect("http://localhost:5000/")

    return '''
    <h1>Upload new File</h1>
    <form id="file-upload" method=post enctype=multipart/form-data>
      <input id="the-file" type=file name=file>
      <input  type=submit value=submit>
    </form>
    '''

def histogram_intersection(a, b):
    v = np.minimum(a, b).sum().round(decimals=1)
    return v

# We're going to do a paired t-test, as ultimately, we're comparing two population means, using observations from
# one sample, where we can pair those with observations from ANOTHER sample. This is assumed in the data as provided.
def paired_ttest(before, after):
    v = stats.ttest_rel(a=before,b=after)
    return v

@app.route('/compare/<experiment_one>/<experiment_two>')
def compare(experiment_one, experiment_two):
    exp_one_stats = r.get(experiment_one+'_statistics').decode('utf-8')
    exp_two_stats = r.get(experiment_two+'_statistics').decode('utf-8')

    exp_one_data = r.get(experiment_one).decode('ascii')
    exp_two_data = r.get(experiment_two).decode('ascii')

    df_data_1 = pd.read_csv(io.StringIO(exp_one_data), delimiter=',', header='infer')
    df_data_2 = pd.read_csv(io.StringIO(exp_two_data), delimiter=',', header='infer')

    df_data_2 = df_data_2.rename(columns={"query_number": "query_number_q2", "metric_type": "metric_type_q2", "score": "score_q2"})

    df_stats_1 = pd.read_json(exp_one_stats, typ='series')
    df_stats_2 = pd.read_json(exp_two_stats, typ='series')

    # Calculate P-Value between query results

    merged_stats = pd.concat([df_stats_1, df_stats_2], axis=1, sort=False)
    merged_stats['absolute_difference'] = merged_stats[0] - merged_stats[1]
    print(merged_stats)

    merged_data = pd.concat([df_data_1, df_data_2], axis=1, sort=False)
    merged_data['absolute_difference'] = merged_data['score'] - merged_data['score_q2']
    print(merged_data)

    # Correlation, covariance
    stats_corr = merged_stats.corr(method=histogram_intersection)
    stats_cov = merged_stats.cov()

    data_corr = merged_data.corr(method=histogram_intersection)
    data_cov = merged_data.cov()

    aggregator = dict()
    aggregator["merged_stats"] = merged_stats.to_dict()
    aggregator["merged_data"] = merged_data.to_dict()
    aggregator["stats_corr"] = stats_corr.to_dict()
    aggregator["stats_cov"] = stats_cov.to_dict()
    aggregator["data_corr"] = data_corr.to_dict()
    aggregator["data_cov"] = data_cov.to_dict()

    print(merged_data)
    ttest_result = paired_ttest(merged_data['score'], merged_data['score_q2'])
    ttest_aggregator = dict()
    ttest_aggregator['statistic'] = ttest_result.statistic
    ttest_aggregator['pvalue'] = ttest_result.pvalue
    aggregator['ttest'] = ttest_aggregator
    return ujson.dumps(aggregator)


@app.route("/data")
def data():
    return jsonify("abc")


@app.route('/experiment/<experiment_id>')
def experiment(experiment_id):
    aggregator = dict()
    exp_one_data = r.get(experiment_id).decode('ascii')
    df_data_1 = pd.read_csv(io.StringIO(exp_one_data), delimiter=',', header='infer')

    aggregator["data"] = df_data_1.to_dict()
    aggregator['stats'] = r.get(experiment_id+'_statistics').decode('utf-8')
    return ujson.dumps(aggregator)


@app.route('/', methods=['GET', 'POST'])
@app.route('/index')
def hello():
    return render_template('viz.html')


def experiment_list():
    experiments = [element.decode("utf-8") for element in r.smembers("experiments")]
    return experiments


@app.route('/experiments')
def experiments():
    experiment_holder = collections.defaultdict(list)
    for element in r.smembers("experiments"):
        experiment_holder["experiments"].append(str(element.decode("utf-8")))
    return_json = ujson.dumps(experiment_holder)
    return return_json


if __name__ == '__main__':
    app.secret_key = b'03#y2ualiugheQ0k\n\xec]/'
    app.config['SESSION_TYPE'] = 'filesystem'
    app.debug = True

    app.run(debug=True, host='0.0.0.0')