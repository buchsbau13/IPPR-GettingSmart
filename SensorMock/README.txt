>>Prerequisites<<
Python 2.7 and the python module 'requests' (install using pip)

>>Setup<<
1) Make sure your FIWARE instance is running
2) Change the [contextbroker] and [idas] sections in the config.ini according to your FIWARE setup

>>Execution<<
'SendRandMeasurements.py':

python .\SendRandMeasurements.py test-sensor-data.txt
(you can replace 'test-sensor-data.txt' with your own file)

'SendCoordList.py':

python .\SendCoordList.py Bus_1 l test-coords.txt
(replace 'Bus_1' (sensor id) and 'l' (alias for location attribute) with appropriate values from your setup,
you can replace 'test-coords.txt' with your own file)