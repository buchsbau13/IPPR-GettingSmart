>>Prerequisites<<
Python 2.7 and the python module 'requests' (install using pip)

>>Setup<<
1) Make sure your FIWARE instance is running
2) Change the [contextbroker] and [idas] sections in the config.ini according to your FIWARE setup

>>Execution<<
'SendRandMeasurements.py':

python .\SendRandMeasurements.py test-data.txt
(you can replace 'test-data.txt' with your own file)

'SendCoordList.py':

python .\SendCoordList.py Bus_1 apimobile l test-coords.txt
(replace 'Bus_1' (sensor id), 'apimobile' (api key) and 'l' (alias for location attribute)
 with appropriate values from your setup, you can replace 'test-coords.txt' with your own file)

'CreateObjects.py':

python .\CreateObjects.py ent Lamp_1.txt
(replace 'ent' with the type of object you want to create ('ent' for entity, 'srv' for service,
 'dev' for device and 'sub' for subscription), replace 'Lamp_1.txt' with the name of the file
 containing the corresponding payload in json format)