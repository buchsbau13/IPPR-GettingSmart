>>Prerequisites<<
Python 2.7 and the python module 'requests' (install using pip)

>>Setup<<
1) Make sure your FIWARE instance is running
2) Change the [contextbroker], [idas], [service] and [idm] sections in the config.ini according to your FIWARE setup

>>Execution<<
'ManageObjects.py':

python .\ManageObjects.py add .\services.json
(Replace 'add' with 'del' if you want to remove objects instead of creating them. The file '.\services.json'
 can be replaced by a different file containing service/entity/device/subscription data in JSON format.)