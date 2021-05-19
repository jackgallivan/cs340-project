"""
Flask app to power NASA RDMS front-end.

Authors: Richie Stuver and Jack Gallivan
Date Created: 05-18-21
"""

from flask import Flask, json, render_template, request
import os
import database.db_connector as db


# Config

app = Flask(__name__)
db_connection = db.connect_to_database()


# Routes

@app.route("/")
def root():
    return render_template("index.j2")

@app.route("/devices")
def devices():
    query = "SELECT deviceID, deviceName, dateLaunched, manufacturer, locationID, missionID FROM devices;"
    results = db.execute_query(db_connection=db_connection, query=query)
    return render_template("devices.j2", data=results)

@app.route("/functions")
def functions():
    query = "SELECT functionID, functionName, description FROM functions;"
    results = db.execute_query(db_connection=db_connection, query=query)
    return render_template("devices.j2", data=results)

@app.route("/locations")
def locations():
    query = "SELECT locationID, locationName, localsystem, localBody FROM locations;"
    results = db.execute_query(db_connection=db_connection, query=query)
    return render_template("locations.j2", data=results)

@app.route("/get-dropdown-data")
def get_dropdown_data():
    """
    hit this endpoint to retrieve data for dropdown menus
    TODO: have method figure out which page made the request. 
    TODO: send the correct query based on the correct page
    """
    request.get_json()
    print(request.path)
    query = "SELECT locationName FROM locations;"
    results = db.execute_query(db_connection=db_connection, query=query)
    print(results)
    return (json.jsonify(results), 200)

@app.route("/reset")
def reset_db():
    """
    Reset the NASA RDMS database
    """

    with open("database/load_db.sql", 'r') as file:
        multi_cursor = db_connection.cursor()
        for result in multi_cursor.execute(file.read(), multi=True):
            result.fetchall()
        db_connection.commit()
        multi_cursor.close()

    return "Reset successful!"


# Listener

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 3000))
    app.run(port=port, debug=True)
