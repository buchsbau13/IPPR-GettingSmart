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
import sys
import json
from pymongo import MongoClient

CONFIG_FILE='./rem-dup-config.ini'

NUM_ARG=len(sys.argv)
COMMAND=sys.argv[0]
FLAG=''

if NUM_ARG>1:
    FLAG=sys.argv[1]

def delDocs(db, collection, dupObjs, flag):
    # If this is a dry run, do not delete the duplicates
    if flag!='--dryRun':
        print 'Removing duplicate batch of collection "'+collection+'"...'
        db[collection].delete_many({'_id':{'$in':dupObjs}})

if NUM_ARG!=1 and FLAG!='--dryRun':
    print 'Usage: '+COMMAND+' [--dryRun]'
    print '  Configure the preferences in the file "rem-dup-config.ini".'
    print '  To show potential duplicates without deleting them, use the --dryRun flag.'
    print '  List of available settings:'
    print '        host = Host of the MongoDB instance'
    print '        port = Port of the MongoDB instance'
    print '        database = Name of the database that should be checked for duplicates'
    print '        objKeysJSON = JSON string with object keys that should be used for finding duplicates'
    print '        excludeCol = Collections with this term in their name will be excluded (ignored if term is empty)'
    print '        includeCol = Only collections with this term in their name will be processed (ignored if term is empty)'
    print
    print '        -> The script connects to the configured MongoDB instance and deletes the duplicates'
    print '           in all collections of the chosen database'

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
KEYS=config.get('mongo', 'objKeysJSON')
EXCLUDE=config.get('mongo', 'excludeCol')
INCLUDE=config.get('mongo', 'includeCol')

# Generate $group object
group=json.loads(KEYS)

# Connect to MongoDB
mongo=MongoClient(HOST,int(PORT))
db=mongo[DATABASE]

# Get collection names of database
colList=db.list_collection_names()

# Find and remove duplicates of every collection in database
for collection in colList:
    # Only check for duplicates if collection was not excluded
    if EXCLUDE=='' or EXCLUDE not in collection:
        # If collection was not excluded, check if it was explicitly included
        if INCLUDE=='' or INCLUDE in collection:
            print 'Processing collection "'+collection+'" of database "'+DATABASE+'"...'

            dupObjs=[]
            pipeline=[
                { "$group": { 
                    "_id": group,
                    "dups": { "$addToSet": "$_id" }, 
                    "count": { "$sum": 1 } 
                }}, 
                { "$match": { 
                    "count": { "$gt": 1 }
                }}
            ]
            aggr=list(db[collection].aggregate(pipeline, allowDiskUse=True))

            for doc in aggr:
                for cnt in range(0, len(doc['dups'])-1):
                    dupObjs.append(doc['dups'][cnt])
                    print 'Duplicate found! (ID: '+str(doc['dups'][cnt])+')'

                # Remove documents once 10000 duplicates were found (otherwise the list gets too large)
                if len(dupObjs)>10000:
                    delDocs(db, collection, dupObjs, FLAG)
                    dupObjs=[]

            if len(dupObjs)>0:
                delDocs(db, collection, dupObjs, FLAG)
            elif len(aggr)==0:
                print 'No duplicates found!'
            
            print

print 'Finished!'