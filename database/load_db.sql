SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS operators;
DROP TABLE IF EXISTS device_function;
DROP TABLE IF EXISTS functions;
DROP TABLE IF EXISTS devices;
DROP TABLE IF EXISTS missions;
DROP TABLE IF EXISTS locations;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE locations (
  locationID int(11) AUTO_INCREMENT NOT NULL PRIMARY KEY,
  locationName varchar(255) UNIQUE NOT NULL,
  localSystem varchar(255) NOT NULL,
  localBody varchar(255) NOT NULL
);

CREATE TABLE missions (
  missionID int(11) AUTO_INCREMENT NOT NULL PRIMARY KEY,
  missionName varchar(255) UNIQUE NOT NULL,
  objective varchar(255) NOT NULL,
  locationID int(11) NOT NULL,
  FOREIGN KEY (locationID) REFERENCES locations (locationID) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE devices (
  deviceID int(11) AUTO_INCREMENT NOT NULL PRIMARY KEY,
  deviceName varchar(255) UNIQUE NOT NULL,
  dateLaunched date NOT NULL,
  manufacturer varchar(255) NOT NULL,
  locationID int(11) NOT NULL,
  missionID int(11) DEFAULT NULL,
  FOREIGN KEY (locationID) REFERENCES locations (locationID) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (missionID) REFERENCES missions (missionID) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE functions (
  functionID int(11) AUTO_INCREMENT NOT NULL PRIMARY KEY,
  functionName varchar(255) UNIQUE NOT NULL,
  description varchar(255)
);

CREATE TABLE device_function (
  deviceID int(11) NOT NULL,
  functionID int(11) NOT NULL,
  FOREIGN KEY (deviceID) REFERENCES devices (deviceID) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (functionID) REFERENCES functions (functionID) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE (deviceID, functionID)
);

CREATE TABLE operators (
  operatorID int(11) AUTO_INCREMENT NOT NULL PRIMARY KEY,
  operatorName varchar(255) UNIQUE NOT NULL,
  deviceID int(11),
  FOREIGN KEY (deviceID) REFERENCES devices (deviceID) ON DELETE SET NULL ON UPDATE CASCADE
);


INSERT INTO locations (locationName, localsystem, localBody)
VALUES ('Stickney Crater', 'Solar System', 'Phobos'),
  ('Jezero Crater', 'Solar System', 'Mars'),
  ('136108 Haumea low orbit', 'Solar System', '136108 Haumea'),
  ('Europa surface', 'Solar System', 'Europa'),
  ('Interstellar Space', 'Milky Way', 'N/A'),
  ('Arrokoth', 'Solar System', 'Kuiper Belt'),
  ('Psyche', 'Solar System', 'Asteroid Belt'),
  ('Bennu', 'Solar System', 'Asteroid Belt'),
  ('Enceladus high orbit', 'Solar System', 'Enceladus'),
  ('Titan subsurface ocean', 'Solar System', 'Titan');

INSERT INTO missions (missionName, objective, locationID)
VALUES ('Chinese Lunar Exploration Program', 'ongoing series of robotic Moon missions by the China National Space Administration (Wikipedia)', 1),
  ('Voyager', 'Designed to take advantage of a rare planetary alignment to study the outer solar system up close. Voyager 2 targeted Jupiter, Saturn, Uranus and Neptune (NASA)', 5),
  ('Mars 2020', 'Seek signs of ancient life and collect samples of rock and regolith (broken rock and soil) for possible return to Earth (NASA)', 2),
  ('Hayabusa 2', 'six-year mission to study the asteroid Ryugu and to collect samples to bring to Earth for analysis (NASA)', 3),
  ('New Horizons', 'Pluto Flyby, Kuiper Belt Object Flyby (NASA)', 4),
  ('Psyche', 'will explore a metal-rich asteroid in the main asteroid belt between Mars and Jupiter (NASA)', 5),
  ('OSIRIS-REx', 'successfully collect a sample from an asteroid (NASA)', 6),
  ('JUICE (JUpiter ICy moons Explorer)', 'will explore Jupiter and three of its icy moons in depth (NASA)', 7),
  ('Cassini–Huygens', 'study the planet Saturn and its system, including its rings and natural satellites. (Wikipedia)', 8),
  ('Tianwen', 'send a robotic spacecraft to Mars, consisting of an orbiter, deployable camera, lander and the Zhurong rover (Wikipedia)', 9);


INSERT INTO devices (deviceName, dateLaunched, manufacturer, locationID, missionID)
VALUES ('Voyager 2', '1977-08-20', 'NASA', 1, 2),
  ('Perseverance Rover', '2020-07-30', 'NASA', 3, 2),
  ('OSIRIS-REx', '2016-09-08', 'NASA', 4, 8),
  ('Huygens', '1997-10-15', 'ESA', 5, 7),
  ('Hayabusa 2', '2014-12-03', 'JAXA', 4, 6),
  ('New Horizons', '2006-01-19', 'NASA', 6, 9),
  ("Chang'e 5", '2020-11-23', 'CNSA', 7, 4),
  ('Zhurong', '2020-07-23', 'CNSA', 8, 10),
  ('Pioneer 11', '1973-04-06', 'NASA', 4, 5),
  ('Jupiter Icy Moons Explorer', '2022-06-09', 'ESA', 6, 1);

INSERT INTO functions (functionName, description)
VALUES ('Ultraviolet Spectrometer', 'Measures ultraviolet light wavelengths'),
  ('High-Gain Antenna', 'Transmits directly to and from Earth'),
  ('LIDAR', 'Measures distance to objects'),
  ('Doppler Wind Experiment', 'Uses radio signals to deduce atmospheric properties'),
  ('Ion Engine', "Used to change a device's orbit"),
  ('MastCam', '3-D color imaging and video camera'),
  ('Heat Shield', 'Protects device upon atmosphere entry'),
  ('Supersonic Parachute', 'High-speed landing parachute'),
  ('Magnetometer', 'Measures magnetic fields near the device'),
  ('CCD Array', 'Wide-spectrum telescopic imaging');

INSERT INTO device_function (deviceID, functionID)
VALUES (1, 1),
  (2, 2),
  (3, 3),
  (4, 4),
  (5, 5),
  (6, 6),
  (7, 7),
  (8, 8),
  (9, 9),
  (10, 10),
  (9, 1),
  (2, 8),
  (3, 10),
  (3, 7),
  (2, 7);

INSERT INTO operators (operatorName, deviceID)
VALUES ('Adriana Ocampom', 1),
  ('John Grotzinger', 2),
  ('Javier Cerna', 3),
  ('Sue Smrekar', 4),
  ('Candice Hansen', 5),
  ('Ravi Prakash', 6),
  ('James Garvin', 7),
  ('Xianzhe Jia', 8),
  ('Ashley Stroupe', 9),
  ('Todd Barber', 10),
  ('Philip Twu', NULL);
