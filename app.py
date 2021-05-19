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
def devices_route():
    query = "SELECT deviceID, deviceName, dateLaunched, manufacturer, locationName, missionName \
            FROM devices \
            JOIN locations ON devices.locationID = locations.locationID \
            JOIN missions ON devices.missionID = missions.missionID;"
    results = db.execute_query(db_connection=db_connection, query=query)
    return render_template("devices.j2", data=results)

@app.route("/functions")
def functions_route():
    query = "SELECT functionID, functionName, description \
            FROM functions;"
    results = db.execute_query(db_connection=db_connection, query=query)
    return render_template("functions.j2", data=results)

@app.route("/device_function")
def device_function_route():
    query = "SELECT deviceName, functionName FROM device_function \
            JOIN devices ON device_function.deviceID = devices.deviceID \
            JOIN functions ON device_function.functionID = functions.functionID;"
    results = db.execute_query(db_connection=db_connection, query=query)
    return render_template("device_function.j2", data=results)

@app.route("/missions")
def missions_route():
    query = "SELECT missionID, missionName, objective, locationName \
            FROM missions JOIN locations ON missions.locationID = locations.locationID;"
    results = db.execute_query(db_connection=db_connection, query=query)
    return render_template("missions.j2", data=results)

@app.route("/locations")
def locations_route():
    query = "SELECT locationID, locationName, localsystem, localBody \
            FROM locations;"
    results = db.execute_query(db_connection=db_connection, query=query)
    return render_template("locations.j2", data=results)

@app.route("/get-dropdown-data", methods=['POST'])
def get_dropdown_data():
    """
    hit this endpoint to retrieve data for dropdown menus
    TODO: have method figure out which page made the request. 
    TODO: send the correct query based on the correct page
    """
    
    valid_dropdowns = {"location": "SELECT locationName FROM locations;", 
                       "mission": "SELECT missionName FROM missions;", 
                       "device": "SELECT deviceName FROM devices;"}

    dropdowns = request.get_json()
    
    results = {}

    for dropdown in dropdowns: 
        if dropdown in valid_dropdowns:
            print("executing query for " + str(dropdown))

            query = valid_dropdowns[dropdown]
            results[dropdown] = db.execute_query(db_connection=db_connection, query=query)
            print(results[dropdown])        

    # query = "SELECT locationName FROM locations;"
    # results = db.execute_query(db_connection=db_connection, query=query)
    # print(results)
    return (json.jsonify(results), 200)
    
@app.route("/operators")
def operators_route():
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
