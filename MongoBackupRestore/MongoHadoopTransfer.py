#!/usr/bin/env python

# Copyright 2015 Telefonica Investigacion y Desarrollo, S.A.U
# 
# This file is part of FIGWAY software (a set of tools for FIWARE Orion ContextBroker and IDAS2.6).
#
# FIGWAY is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as 
# published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
# FIGWAY is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of 
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License along with FIGWARE. 
# If not, see http://www.gnu.org/licenses/
#
# For those usages not covered by the GNU Affero General Public License please contact with: Carlos Ralli Ucendo [ralli@tid.es] 
# Developed by Carlos Ralli Ucendo (@carlosralli), Apr 2015.

import ConfigParser
import io
import os
import re
import sys
import json
import datetime
from pymongo import MongoClient

CONFIG_FILE='./mh-transfer-config.ini'

NUM_ARG=len(sys.argv)
COMMAND=sys.argv[0]

if NUM_ARG!=1:
    print 'Usage: '+COMMAND
    print '  Configure the preferences in the file "mh-transfer-config.ini".'
    print '  List of available settings:'
    print '        host = Host of the MongoDB instance'
    print '        port = Port of the MongoDB instance'
    print '        database = Name of the MongoDB database'
    print '        servicePath = FIWARE service path'
    print '        startDateUTC = Only retrieve datasets newer than this date (ignored if term is empty)'
    print '        endDateUTC = Only retrieve datasets older than this date (is set to current date if term is empty)'
    print '        excludeCol = Collections with this term in their name will be excluded (ignored if term is empty)'

    print
    sys.exit(2)

# Read the configuration file
with open(CONFIG_FILE,'r+') as f:
    sample_config=f.read()
config=ConfigParser.RawConfigParser(allow_no_value=True)
config.readfp(io.BytesIO(sample_config))

HOST=config.get('mongo', 'host')
PORT=config.get('mongo', 'port')
DATABASE=config.get('mongo', 'database')
SRV_PATH=config.get('mongo', 'servicePath')
START=config.get('mongo', 'startDateUTC')
END=config.get('mongo', 'endDateUTC')
EXCLUDE=config.get('mongo', 'excludeCol')

# Connect to MongoDB
mongo=MongoClient(HOST,int(PORT))
db=mongo[DATABASE]

# Get collection names of database
colList=db.list_collection_names()

# Create date filter
dateFilter={'$lt': datetime.datetime.utcnow()}

if END!='':
    dateFilter['$lt']=datetime.datetime.strptime(END, '%Y-%m-%dT%H:%M:%S')

if START!='':
    dateFilter['$gt']=datetime.datetime.strptime(START, '%Y-%m-%dT%H:%M:%S')

# Get database entries for every collection (filtered by date filter) and write to file
dir='./HadoopFiles'
if not os.path.exists(dir):
    os.makedirs(dir)

for collection in colList:
    if EXCLUDE=='' or EXCLUDE not in collection:
        print 'Processing collection "'+collection+'" of database "'+DATABASE+'"...'
        
        # Extract entity ID and type from collection name
        matchObj=re.match('.*xffff(.*)xffff(.*)', collection)
        entID=matchObj.group(1)
        entType=matchObj.group(2)

        hadoopFile=open(dir+'/'+entID+'-'+entType+'-hadoop.json', 'w')
        pipeline=[
            { "$group": {
                "_id": { "recvTime": "$recvTime" },
                "entries": { "$addToSet": { "attrName": "$attrName", "attrValue": "$attrValue" }},
            }},
            { "$match": {
                "_id.recvTime": dateFilter
            }}
        ]
        aggr=list(db[collection].aggregate(pipeline, allowDiskUse=True))

        for doc in aggr:
            timestamp=doc['_id']['recvTime'].strftime('%Y-%m-%dT%H:%M:%S')+doc['_id']['recvTime'].strftime('.%f')[:4]+'Z'
            timestampDict={'recvTime': timestamp, 'fiwareServicePath': SRV_PATH, 'entityId': entID, 'entityType': entType}
            for entry in doc['entries']:
                timestampDict.update({entry['attrName']: entry['attrValue'], entry['attrName']+'_md': [{'name': 'TimeInstant',
                    'type': 'ISO8601', 'value': timestamp}]})
            hadoopFile.write(json.dumps(timestampDict)+'\n')
        hadoopFile.close()
        
        print 'Collection "'+collection+'" of database "'+DATABASE+'" parsed successfully!'
        print

print 'Finished!'