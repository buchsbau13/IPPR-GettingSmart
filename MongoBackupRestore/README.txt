>>Prerequisites<<
Python 2.7 and the python modules 'PyMongo' and 'arrow' (install using pip)

>>Setup<<
Modify the file settings.ini as needed

>>Execution<<
'RemoveDuplicates.py':

python .\RemoveDuplicates.py
(The script connects to the configured MongoDB instance and deletes the duplicates
 in all collections of the chosen database)

'Mongo2HadoopParser.py':

python .\Mongo2HadoopParser.py Bus_1 mobile / .\bus_1.json
(The script parses the MongoDB to the Hadoop database format. The resulting file
 will be created as '<ENTITY_ID>-<ENTITY_TYPE>-hadoop.json' in the same folder)

'MongoRow2HadoopColParser.py':

python .\MongoRow2HadoopColParser.py Bus_1 mobile / .\bus_1.json
(Same as Mongo2HadoopParser, but parses to Hadoop column-oriented format. The resulting file
 will be created as '<ENTITY_ID>-<ENTITY_TYPE>-hadoop-col.json' in the same folder)

'MongoHadoopTransfer.py':

python .\MongoHadoopTransfer.py
(The script fetches all collections of the configured MongoDB database and converts them to
 the Hadoop column-oriented format. The resulting files will be created as
 '<ENTITY_ID>-<ENTITY_TYPE>-hadoop.json' in the folder 'HadoopFiles')