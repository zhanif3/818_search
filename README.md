# VIRE: Visual Information Retrieval Evaluation

## Set up instructions:
ssh -i ~/Downloads/DNS.pem ubuntu@ec2-18-191-73-24.us-east-2.compute.amazonaws.com

### Install Packages
<br>sudo apt-get update
<br>sudo apt-get install python3-pip
<br>sudo apt-get install python3-venv
<br>sudo apt-get install postgresql-server-dev-10
For mac:
<br>brew install redis
<br>git clone https://github.com/zhanif3/818_search.git

### First, install the needed python environnment
cd 818_search
<br> python3 -m venv env

### Run the virtual environment
source env/bin/activate

### Install needed python packages
(env)$ pip install flask
<br>(env)$ pip install psycopg2

### Set up the database (DO NOT DO THIS ON AWS SERVER)
<br> sudo -u postgres createuser --interactive
<br>&nbsp&nbsp&nbsp    818project, y

<br> sudo -u postgres createdb sammy

<br> sudo adduser sammy

<br> sudo -i -u sammy
<br> psql

### What DB am I connected to?
\conninfo

## Run instructions
redis-server
<br>python server.py

Visit URLs on browser: 
<br> Upload csv files of the format [query ID],[score_name],[score] here: http://localhost:5000/upload
<br> For main visualizations: http://localhost:5000/