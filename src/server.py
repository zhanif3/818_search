from flask import Flask

from flask.ext.sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)

POSTGRES_USER = "818_user"
POSTGRES_PW = "818"
POSTGRES_URL = "127.0.0.1:5432"
POSTGRES_DB = "project"

DB_URL = 'postgresql+psycopg2://{user}:{pw}@{url}/{db}'.format(user=POSTGRES_USER,pw=POSTGRES_PW,url=POSTGRES_URL,db=POSTGRES_DB)

app.config['SQLALCHEMY_DATABASE_URI'] = DB_URL

db = SQLAlchemy(app)

class Experiment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    experiment_data = db.Column(db.String(200), unique=False, nullable=True)

@app.route('/upload', methods=['GET', 'POST'])
def upload():
    if flask.request.method == 'POST':
        return 'Submitted experiment.'

    return '''<form method="POST">
                  Data: <input type="text" name="data"><br>
                  <input type="submit" value="Submit"><br>
              </form>'''

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
