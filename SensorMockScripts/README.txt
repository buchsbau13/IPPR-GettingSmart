>>Prerequisites<<
Python 2.7 and the python module 'requests' (install using pip)

>>Setup<<
1) Make sure your FIWARE instance is running
2) Change the [contextbroker] and [idas] sections in the config.ini according to your FIWARE setup

>>Execution<<
'SendMeasurements.py':

python .\SendMeasurements.py .\test-data.txt
(you can replace 'test-data.txt' with your own file)

'SendCoordList.py':

python .\SendCoordList.py Dev_Bus_1 apitest l .\test-coords.txt
(replace 'Dev_Bus_1' (device id), 'apitest' (api key) and 'l' (alias for location attribute)
 with appropriate values from your setup, you can replace 'test-coords.txt' with your own file)

'SendCombinedValues.py':

python .\SendCombinedValues.py Dev_Bus_1 apitest .\bus_1-values.txt
(you can replace 'bus_1-values.txt' with your own file)