>>Prerequisites<<
Python 2.7 and the python module 'requests' (install using pip)

>>Setup<<
1) Make sure your FIWARE instance is running
2) Change the [idm] and [idas] sections in the config.ini according to your FIWARE setup

>>Execution<<
'SendCombinedValuesSecure.py':

python .\SendCombinedValuesSecure.py Dev_Bus_1 apimobile test@mail.com Pa$$w0rd .\bus_1-values.txt
(replace 'test@mail.com' and 'Pa$$w0rd' with valid user credentials)