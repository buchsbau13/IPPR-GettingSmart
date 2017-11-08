>>Prerequisites<<
Python 2.7 and the python module 'requests' (install using pip)

>>Setup<<
1) Make sure your FIWARE instance is running
2) Change the [contextbroker] and [idas] sections in the config.ini according to your FIWARE setup

>>Execution<<
'SendRandMeasurements.py':

python .\SendRandMeasurements.py test-sensor-data.txt
(you can replace 'test-sensor-data.txt' with your own file)
