"""
Flask app to power NASA RDMS front-end.

Authors: Richie Stuver and Jack Gallivan
Date Created: 05-18-21
"""

from flask import Flask, json, render_template, request, abort
import os
from urllib.parse import urlparse
import database.db_connector as db


# Config

app = Flask(__name__)
db_connection = db.connect_to_database()


# Routes

# GET Handlers

@app.route("/")
def root():
    return render_template("index.j2")

@app.route("/devices")
def devices_route():
    query = ("SELECT deviceID, deviceName, dateLaunched, manufacturer, locationName, missionName "
             "FROM devices "
             "JOIN locations ON devices.locationID = locations.locationID "
             "JOIN missions ON devices.missionID = missions.missionID;")
    cursor = db.execute_query(db_connection=db_connection, query=query)
    results = cursor.fetchall()
    return render_template("devices.j2", data=results)

@app.route("/functions")
def functions_route():
    query = ("SELECT functionID, functionName, description "
             "FROM functions;")
    cursor = db.execute_query(db_connection=db_connection, query=query)
    results = cursor.fetchall()
    return render_template("functions.j2", data=results)

@app.route("/device_function")
def device_function_route():
    query = ("SELECT deviceName, functionName FROM device_function "
             "JOIN devices ON device_function.deviceID = devices.deviceID "
             "JOIN functions ON device_function.functionID = functions.functionID;")
    cursor = db.execute_query(db_connection=db_connection, query=query)
    results = cursor.fetchall()
    return render_template("device_function.j2", data=results)

@app.route("/missions")
def missions_route():
    query = ("SELECT missionID, missionName, objective, locationName "
             "FROM missions JOIN locations ON missions.locationID = locations.locationID;")
    cursor = db.execute_query(db_connection=db_connection, query=query)
    results = cursor.fetchall()
    return render_template("missions.j2", data=results)

@app.route("/locations")
def locations_route():
    query = ("SELECT locationID, locationName, localsystem, localBody "
             "FROM locations;")
    cursor = db.execute_query(db_connection=db_connection, query=query)
    results = cursor.fetchall()
    return render_template("locations.j2", data=results)

@app.route("/operators")
def operators_route():
    query = ("SELECT operatorID, operatorName, deviceName "
             "FROM operators "
             "JOIN devices ON operators.deviceID = devices.deviceID;")
    cursor = db.execute_query(db_connection=db_connection, query=query)
    results = cursor.fetchall()
    return render_template("operators.j2", data=results)

@app.route("/get-dropdown-data", methods=["POST"])
def get_dropdown_data():
    """
    hit this endpoint to retrieve data for dropdown menus
    TODO: have method figure out which page made the request.
    TODO: send the correct query based on the correct page
    """

    valid_dropdowns = {"locationName": "SELECT locationName FROM locations;",
                       "missionName": "SELECT missionName FROM missions;",
                       "deviceName": "SELECT deviceName FROM devices;",
                       "functionName": "SELECT functionName FROM functions;"}

    dropdowns = request.get_json()

    results = {}

    for dropdown in dropdowns:
        if dropdown in valid_dropdowns:
            # print("executing query for " + str(dropdown))

            query = valid_dropdowns[dropdown]
            cursor = db.execute_query(db_connection=db_connection, query=query)
            results[dropdown] = cursor.fetchall()
            # print(results[dropdown])

    # query = "SELECT locationName FROM locations;"
    # results = db.execute_query(db_connection=db_connection, query=query)
    # print(results)
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


# POST Handlers

@app.route("/add-data", methods=['POST'])
def add_data():
    """
    Accessed for INSERT DB operations.
    """
    print("Accessing /add-data routes")
    # Get the data in the request object (to be added to a table)
    # and the root_path, which is the page we are requesting from.
    data = request.get_json()
    print("data: ")
    print(data)
    # root_path = request.script_root
    referrer_path = urlparse(request.referrer).path
    print("referer_path: " + referrer_path)
    # Create the INSERT query, dependent on the root_path
    if referrer_path == '/devices':
        query = (f"INSERT INTO devices (deviceName, dateLaunched, manufacturer, locationID, missionID) "
                 f"VALUES ('{data['deviceName']}', "
                 f"'{data['dateLaunched']}', "
                 f"'{data['manufacturer']}', "
                 f"(SELECT locationID FROM locations WHERE locationName = '{data['locationName']}'), "
                 f"(SELECT missionID FROM missions WHERE missionName = '{data['missionName']}') "
                 f");")

    elif referrer_path == '/functions':
        query = (f"INSERT INTO functions (functionName, description) "
                 f"VALUES ('{data['functionName']}', '{data['description']}');")

    elif referrer_path == '/device_function':
        query = (f"INSERT INTO device_function (deviceID, functionID) "
                 f"VALUES ((SELECT deviceID FROM devices WHERE deviceName = '{data['deviceName']}'), "
                 f"(SELECT functionID FROM functions WHERE functionName = '{data['functionName']}') "
                 f");")

    elif referrer_path == '/missions':
        query = (f"INSERT INTO missions (missionName, objective, locationID) "
                 f"VALUES ('{data['missionName']}', "
                 f"'{data['objective']}', "
                 f"(SELECT locationID FROM locations WHERE locationName = '{data['locationName']}') "
                 f");")

    elif referrer_path == '/locations':
        query = (f"INSERT INTO locations (locationName, localSystem, localBody) "
                 f"VALUES ('{data['locationName']}', '{data['localSystem']}', '{data['localBody']}');")

    elif referrer_path == '/operators':
        query = (f"INSERT INTO operators (operatorName, deviceID) "
                 f"VALUES ('{data['operatorName']}', "
                 f"(SELECT deviceID FROM devices WHERE deviceName = '{data['deviceName']}') "
                 f");")

    else:
        abort(500)
    # Execute the query, then check that a row was added.
    cursor = db.execute_query(db_connection=db_connection, query=query)
    results = {}
    results['id'] = cursor.lastrowid
    if cursor.rowcount == 0:
        # ERROR: no row inserted
        abort(500)
    return (json.jsonify(results), 200)


@app.route('/update-data', methods=['PUT'])
def update_data():
    """edit a single row from a given table."""

    data = request.get_json()
    referrer_path = urlparse(request.referrer).path

    if data:
        if referrer_path == '/devices':
            query = (f"UPDATE devices "
                     f"SET deviceName = '{data['deviceName']}', "
                     f"dateLaunched = '{data['dateLaunched']}', "
                     f"manufacturer = '{data['manufacturer']}', "
                     f"locationID = (SELECT locationID FROM locations WHERE locationName = '{data['locationName']}'), "
                     f"missionID = (SELECT missionID FROM missions WHERE missionName = '{data['missionName']}') "
                     f"WHERE deviceID = '{data['id']}';")
        
        elif referrer_path == '/functions':
            query = (f"UPDATE functions "
                     f"SET functionName = '{data['functionName']}', description = '{data['description']}' "
                     f"WHERE functionID = '{data['id']}';")

        elif referrer_path == '/operators':
            query = (f"UPDATE operators "
                     f"SET operatorName = '{data['operatorName']}', "
                     f"deviceID = (SELECT deviceID FROM devices WHERE deviceName = '{data['deviceName']}') "
                     f"WHERE operatorID = '{data['id']}';") 


        elif referrer_path == '/locations':
            query = (f"UPDATE locations "
                    f"SET locationName = '{data['locationName']}', localSystem = '{data['localsystem']}', localBody = '{data['localBody']}' "
                    f"WHERE locationID = '{data['id']}';")

        elif referrer_path == '/missions':
            query = (f"UPDATE missions "
                     f"SET missionName = '{data['missionName']}', "
                     f"objective = '{data['objective']}', "
                     f"locationID = (SELECT locationID FROM locations WHERE locationName = '{data['locationName']}') "
                     f"WHERE missionID = '{data['id']}';")

    else:
        abort(500)
    
    # Execute the query, then check that a row was added.
    cursor = db.execute_query(db_connection=db_connection, query=query)
    results = {}
    results['id'] = cursor.lastrowid
    if cursor.rowcount == 0:
        # ERROR: no row inserted
        abort(500)

    return (str(referrer_path) + ": updated id " + json.dumps(data['id']), 200)
    
# Error Handlers

@app.errorhandler(404)
def not_found(error):
    return ("404: page not found", 404)

@app.errorhandler(500)
def server_error(error):
    return ("500: Internal server error", 500)


# Listener

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 3000))
    app.run(port=port, debug=True)
