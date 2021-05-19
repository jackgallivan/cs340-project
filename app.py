"""
Flask app to power NASA RDMS front-end.

Authors: Richie Stuver and Jack Gallivan
Date Created: 05-18-21
"""

from flask import Flask, render_template, request
import os
import database.db_connector as db


# Config

app = Flask(__name__)
db_connection = db.connect_to_database()


# Routes

@app.route("/")
def root():
    return render_template("index.j2")

@app.route("/devices", methods=['GET', 'POST'])
def devices_route():
    if request.method == 'GET':
        query = "SELECT deviceID, deviceName, dateLaunched, manufacturer, locationName, missionName \
                FROM devices \
                JOIN locations ON devices.locationID = locations.locationID \
                JOIN missions ON devices.missionID = missions.missionID;"
        results = db.execute_query(db_connection=db_connection, query=query)
        return render_template("devices.j2", data=results)
    else:
        pass #todo: POST method

@app.route("/functions", methods=['GET', 'POST'])
def functions_route():
    if request.method == 'GET':
        query = "SELECT functionID, functionName, description \
                FROM functions;"
        results = db.execute_query(db_connection=db_connection, query=query)
        return render_template("functions.j2", data=results)

@app.route("/device_function", methods=['GET', 'POST'])
def device_function_route():
    if request.method == 'GET':
        query = "SELECT deviceName, functionName FROM device_function \
                JOIN devices ON device_function.deviceID = devices.deviceID \
                JOIN functions ON device_function.functionID = functions.functionID;"
        results = db.execute_query(db_connection=db_connection, query=query)
        return render_template("device_function.j2", data=results)

@app.route("/missions", methods=['GET', 'POST'])
def missions_route():
    if request.method == 'GET':
        query = "SELECT missionID, missionName, objective, locationName \
                FROM missions JOIN locations ON missions.locationID = locations.locationID;"
        results = db.execute_query(db_connection=db_connection, query=query)
        return render_template("missions.j2", data=results)

@app.route("/locations", methods=['GET', 'POST'])
def locations_route():
    if request.method == 'GET':
        query = "SELECT locationID, locationName, localsystem, localBody \
                FROM locations;"
        results = db.execute_query(db_connection=db_connection, query=query)
        return render_template("locations.j2", data=results)

@app.route("/operators", methods=['GET', 'POST'])
def operators_route():
    if request.method == 'GET':
        query = "SELECT operatorID, operatorName, deviceName \
                FROM operators \
                JOIN devices ON operators.deviceID = devices.deviceID;"
        results = db.execute_query(db_connection=db_connection, query=query)
        return render_template("operators.j2", data=results)

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


# Listener

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 3000))
    app.run(port=port, debug=True)
