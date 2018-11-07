>>Prerequisites<<
Python 2.7 and the python modules 'PyMongo' and 'arrow' (install using pip)

>>Setup<<
Modify the file settings.ini as needed

>>Execution<<
'RemoveDuplicates.py':

python .\RemoveDuplicates.py
(The script connects to the configured MongoDB instance and deletes the duplicates
 in all collections of the chosen database)

'MongoHadoopParser.py':

python .\MongoHadoopParser.py Bus_1 mobile / .\bus_1.json
(The script parses the MongoDB to the Hadoop database format. The resulting file
 will be created as '<ENTITY_ID>-<ENTITY_TYPE>-hadoop.json' in the same folder)