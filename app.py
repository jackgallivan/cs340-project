"""
Flask app to power NASA RDMS front-end.

Authors: Richie Stuver and Jack Gallivan
Date Created: 05-18-21
"""

from flask import Flask
import mysql.connector
from markupsafe import escape
import os

import database.db_connector as db

app = Flask(__name__)
db_connection = db.connect_to_database()

"""Routes"""

@app.route("/")
def test_db():
    """
    Test the db connection. Assumes that you have a database set up according to .env file and 
    that database contains the table bsg_people. 
    """
    #db_connection = db.connect_to_database()
    query = "SELECT * FROM bsg_people;"
    results = db.execute_query(db_connection=db_connection, query=query)

    data = "<p>"
    for row in results:
        for field in row:
            data += "<b>" + str(field) + "</b>" + ": " + str(row[field]) + " "
        data += "</p>"
    return data


@app.route("/reset")
def reset_db():
    """
    Reset the NASA RDMS database
    """

    with open("database/load_db.sql", 'r') as file:
        # db.execute_query(db_connection=db_connection, query=file.read())
        multi_cursor = db_connection.cursor()
        for result in multi_cursor.execute(file.read(), multi=True):
            result.fetchall()
        db_connection.commit()
        multi_cursor.close()
    
    return "Reset successful!"

    
