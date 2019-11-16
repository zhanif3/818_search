from flask import Flask, flash, request, redirect, url_for
from werkzeug.utils import secure_filename
import os
import pandas as pd
import redis
import io

app = Flask(__name__)

ALLOWED_EXTENSIONS = {'txt', 'csv'}

POSTGRES_USER = "818_user"
POSTGRES_PW = "818"
POSTGRES_URL = "127.0.0.1:5432"
POSTGRES_DB = "project"

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/upload', methods=['GET', 'POST'])
def upload():
    if request.method == 'POST':
        # check if the post request has the file part
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        file = request.files['file']
        # if user does not select file, browser also
        # submit an empty part without filename
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_contents = file.read()
            data = file_contents.decode("utf-8")
            df = pd.read_csv(io.StringIO(data), delimiter=',', header='infer')

            print(df)


            return redirect(url_for('upload', filename=filename))
    return '''
    <!doctype html>
    <title>Upload new File</title>
    <h1>Upload new File</h1>
    <form method=post enctype=multipart/form-data>
      <input type=file name=file>
      <input type=submit value=Upload>
    </form>
    '''

@app.route('/compare/<path:experiment_one>/<path:experiment_two>')
def compare():
    return 'This is the compare function for two experiments.'

@app.route('/experiment')
def experiment():
    return 'This is the view of an experiment'

@app.route('/hello')
def hello():
    return 'Hello!'
 
if __name__ == '__main__':

    app.run(debug=True, host='0.0.0.0')