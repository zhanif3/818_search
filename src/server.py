from flask import Flask
import psycopg2
import os

app = Flask(__name__)

POSTGRES_USER = "818_user"
POSTGRES_PW = "818"
POSTGRES_URL = "127.0.0.1:5432"
POSTGRES_DB = "project"


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
    # Connect to an existing database
    conn = psycopg2.connect("dbname=test user=postgres")

    # Open a cursor to perform database operations
    cur = conn.cursor()
