>>Prerequisites<<
Python 2.7 and the python module 'requests' (install using pip)

>>Setup<<
1) Make sure your FIWARE instance is running
2) Change the [contextbroker], [idas] and [cygnus] sections in the config.ini according to your FIWARE setup

>>Execution<<
'CreateObjects.py':

python .\CreateObjects.py ent Lamp_1.txt
(replace 'ent' with the type of object you want to create ('ent' for entity, 'srv' for service or
 'dev' for device), replace 'Lamp_1.txt' with the name of the file
 containing the corresponding payload in json format)
 
'CreateSubscriptions.py':
 
python .\CreateSubscriptions.py subscriptions.txt
(you can replace 'subscriptions.txt' with your own file)