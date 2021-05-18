"""
Flask app to power NASA RDMS front-end.

Authors: Richie Stuver and Jack Gallivan
Date Created: 05-18-21
"""

from flask import Flask

app = Flask(__name__)

@app.route("/")
def hello_world():
    return "Hello world!"