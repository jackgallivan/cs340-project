-- Data Manipulation Queries:
-- using @ to denote variables


-- LOCATIONS PAGE

-- Show all locations
SELECT locationID, locationName, localsystem, localBody
FROM locations;

-- Add new location
INSERT INTO locations (locationName, localsystem, localBody)
VALUES (@locationName_new, @localsystem_new, @localBody_new);

-- Update Location
UPDATE locations
SET locationName = @locationName_update, localSystem = @localSystem_update, localBody = @localBody_update
WHERE locationID = @locationID;

-- Delete Location
DELETE FROM locations
WHERE locationID = @locationID;


-- MISSIONS PAGE

-- Show all missions
SELECT missionID, missionName, objective, locationName
FROM missions JOIN locations ON missions.locationID = locations.locationID;

-- Query dropdown values
SELECT locationName FROM locations;

-- Add new mission

INSERT INTO missions (missionName, objective, locationID)
VALUES (@missionName_new,
@objective_new,
(SELECT locationID FROM locations WHERE locationName = @locationName_new)
);

-- Update mission
UPDATE missions
SET missionName = @missionName_update,
    objective = @objective_update,
    locationID = (SELECT locationID FROM locations WHERE locationName = @locationName_new),
WHERE missionID = @missionID;

-- Delete mission
DELETE FROM missions
WHERE missionID = @missionID;


-- DEVICES PAGE

-- Show all devices
SELECT deviceID, deviceName, dateLaunched, manufacturer, locationName, missionName
FROM devices
JOIN locations ON devices.locationID = locations.locationID
JOIN missions ON devices.missionID = missions.missionID;

-- Query dropdown values
SELECT locationName FROM locations;
SELECT missionName FROM missions;

-- Add new device
INSERT INTO devices (deviceName, dateLaunched, manufacturer, locationID, missionID)
VALUES (@deviceName_new,
 @dateLaunched_new,
 @manufacturer_new,
 (SELECT locationID FROM locations WHERE locationName = @locationName_new),
 (SELECT missionID FROM missions WHERE missionName = @missionName_new)
);

-- Update device
UPDATE devices
SET deviceName = @deviceName_update,
    dateLaunched = @dateLaunched_update,
    manufacturer = @manufacturer_update,
    locationID = (SELECT locationID FROM locations WHERE locationName = @locationName_update),
    missionID = (SELECT missionID FROM missions WHERE missionName = @missionName_update)
WHERE deviceID = @deviceID;

-- Delete device
DELETE FROM devices
WHERE deviceID = @deviceID;


-- FUNCTIONS PAGE

-- Show all functions
SELECT functionID, functionName, description
FROM functions;

-- Add new function
INSERT INTO functions (functionName, description)
VALUES (@functionName_new, @description_new);

-- Update function
UPDATE functions
SET functionName = @functionName_update, description = @description_update
WHERE functionID = @functionID;

-- Delete function
DELETE FROM functions
WHERE functionID = @functionID;


-- DEVICE_FUNCTION PAGE

-- Show all device-function relationships
SELECT deviceName, functionName FROM device_function
JOIN devices ON device_function.deviceID = devices.deviceID
JOIN functions ON device_function.functionID = functions.functionID;

-- Query dropdown values
SELECT deviceName FROM devices;
SELECT functionName FROM functions;


-- Add new device-function relationship
INSERT INTO device_function (deviceID, functionID)
VALUES ((SELECT deviceID FROM devices WHERE deviceName = @deviceName_new),
        (SELECT functionID FROM functions WHERE functionName = @functionName_new)
       );

-- Delete a device-function relationship
DELETE FROM device_function
WHERE deviceID = (SELECT deviceID FROM devices WHERE deviceName = @deviceName_delete)
AND functionID = (SELECT functionID FROM functions WHERE functionName = @functionName_delete);


-- OPERATORS PAGE

-- Show all operators
SELECT operatorID, operatorName, deviceName
FROM operators
JOIN devices ON operators.deviceID = devices.deviceID;

-- Query dropdown values
SELECT deviceName FROM devices;


-- Add new operator
INSERT INTO operators (operatorName, deviceID)
VALUES (@operatorName_new,
 (SELECT deviceID FROM devices WHERE deviceName = @deviceName_new)
);

-- Update Operator
UPDATE operators
SET operatorName = @operatorName_update,
    deviceID = (SELECT deviceID FROM devices WHERE deviceName = @deviceName_update)
WHERE operatorID = @operatorID;

-- Delete Operator
DELETE FROM operators
WHERE operatorID = @operatorID;
