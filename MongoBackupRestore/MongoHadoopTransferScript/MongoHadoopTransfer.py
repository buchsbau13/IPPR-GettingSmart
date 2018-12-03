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
import re
import sys
import json
import datetime
import requests
from pymongo import MongoClient

CONFIG_FILE='./config.ini'

NUM_ARG=len(sys.argv)
COMMAND=sys.argv[0]

def remDups(db, collection):
    print '-- Looking for potential duplicate entries...'
    dupObjs=[]
    pipeline=[
        { "$group": { 
            "_id": {"attrName": "$attrName", "recvTime": "$recvTime"},
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

        # Remove documents once 10000 duplicates were found (otherwise the list gets too large)
        if len(dupObjs)>10000:
            db[collection].delete_many({'_id':{'$in':dupObjs}})
            dupObjs=[]

    if len(dupObjs)>0:
        db[collection].delete_many({'_id':{'$in':dupObjs}})

    if len(aggr)==0:
        print '-- No duplicates found!'
    else:
        print '-- Duplicates of '+str(len(aggr))+' document(s) removed!'

def getFileStatus(host, port, path):
    # Check if file exists
    URL='http://'+host+':'+port+path+'&op=GETFILESTATUS'
    r=requests.get(URL)
    return r.status_code

def createFile(host, port, path):
    # Get redirect URL for CREATE operation
    URL='http://'+host+':'+port+path+'&op=CREATE'
    r=requests.put(URL, allow_redirects=False)
    if r.status_code!=307:
        print '>> Error! (CREATE redirect request)'

    locationData=re.match('.*?:\/\/(.*?)(\/.*)', r.headers['location'])
    node=locationData.group(1)
    newPath=locationData.group(2)
    newPort=''

    if NAMENODE[0] in node:
        newPort=NAMENODE[1]
    elif DATANODE_1[0] in node:
        newPort=DATANODE_1[1]
    elif DATANODE_2[0] in node:
        newPort=DATANODE_2[1]
    elif DATANODE_3[0] in node:
        newPort=DATANODE_3[1]

    # Create file
    URL='http://'+host+':'+newPort+newPath
    r=requests.put(URL)
    if r.status_code==201:
        print ">> Hadoop file created"
    else:
        print '>> Error! (CREATE request)'

def appendData(host, port, path, content):
    # Get redirect URL for APPEND operation
    URL='http://'+host+':'+port+path+'&op=APPEND'
    r=requests.post(URL, allow_redirects=False)
    if r.status_code!=307:
        print '>> Error! (APPEND redirect request)'

    locationData=re.match('.*?:\/\/(.*?)(\/.*)', r.headers['location'])
    node=locationData.group(1)
    newPath=locationData.group(2)
    newPort=''

    if NAMENODE[0] in node:
        newPort=NAMENODE[1]
    elif DATANODE_1[0] in node:
        newPort=DATANODE_1[1]
    elif DATANODE_2[0] in node:
        newPort=DATANODE_2[1]
    elif DATANODE_3[0] in node:
        newPort=DATANODE_3[1]

    # Send data to append
    URL='http://'+host+':'+newPort+newPath
    r=requests.post(URL, data=content)
    if r.status_code==200:
        print ">> Collection data appended to Hadoop file"
    else:
        print '>> Error! (APPEND request)'

if NUM_ARG!=1:
    print 'Usage: '+COMMAND
    print '  Configure the preferences in the file "config.ini".'
    print '  List of available settings:'
    print '     [mongo] section:'
    print '        host = Host of the MongoDB instance'
    print '        port = Port of the MongoDB instance'
    print '        database = Name of the MongoDB database'
    print '        service = FIWARE service/tenant name'
    print '        servicePath = FIWARE service path'
    print '        startDateUTC = Only retrieve datasets newer than this date (ignored if term is empty)'
    print '        endDateUTC = Only retrieve datasets older than this date (is set to current date if term is empty)'
    print '        excludeCol = Collections with this term in their name will be excluded (ignored if term is empty)'
    print '     [hadoop] section:'
    print '        host = Host of the Hadoop instance'
    print '        namenode = Hostname and port of the Hadoop namenode (separated by comma)'
    print '        datanode1 = Hostname and port of the first Hadoop datanode (separated by comma)'
    print '        datanode2 = Hostname and port of the second Hadoop datanode (separated by comma)'
    print '        datanode3 = Hostname and port of the third Hadoop datanode (separated by comma)'
    print '        user = User for the Hadoop instance'

    print
    sys.exit(2)

# Read the configuration file
with open(CONFIG_FILE,'r+') as f:
    sample_config=f.read()
config=ConfigParser.RawConfigParser(allow_no_value=True)
config.readfp(io.BytesIO(sample_config))

MONGO_HOST=config.get('mongo', 'host')
MONGO_PORT=config.get('mongo', 'port')
DATABASE=config.get('mongo', 'database')
SRV=config.get('mongo', 'service')
SRV_PATH=config.get('mongo', 'servicePath')
START=config.get('mongo', 'startDateUTC')
END=config.get('mongo', 'endDateUTC')
EXCLUDE=config.get('mongo', 'excludeCol')

HADOOP_HOST=config.get('hadoop', 'host')
NAMENODE=[str.strip() for str in config.get('hadoop', 'namenode').split(',')]
DATANODE_1=[str.strip() for str in config.get('hadoop', 'datanode1').split(',')]
DATANODE_2=[str.strip() for str in config.get('hadoop', 'datanode2').split(',')]
DATANODE_3=[str.strip() for str in config.get('hadoop', 'datanode3').split(',')]
HADOOP_USER=config.get('hadoop', 'user')

# Connect to MongoDB
mongo=MongoClient(MONGO_HOST,int(MONGO_PORT))
db=mongo[DATABASE]

# Get collection names of database
colList=db.list_collection_names()

# Create date filter
dateFilter={'$lt': datetime.datetime.utcnow()}

if END!='':
    dateFilter['$lt']=datetime.datetime.strptime(END, '%Y-%m-%dT%H:%M:%S')

if START!='':
    dateFilter['$gt']=datetime.datetime.strptime(START, '%Y-%m-%dT%H:%M:%S')

# Get database entries for every collection (filtered by date filter) and append to Hadoop file
for collection in colList:
    if EXCLUDE=='' or EXCLUDE not in collection:
        print 'Processing collection "'+collection+'" of database "'+DATABASE+'"...'
        
        # Remove duplicates, if any
        remDups(db, collection)
        
        # Extract entity ID and type from collection name
        matchObj=re.match('^.*?xffff(.*?)xffff(.*?)(\..*)?$', collection)
        entID=matchObj.group(1)
        entType=matchObj.group(2)
        filename=entID+'_'+entType

        colString=''
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
        
        path='/webhdfs/v1/user/'+HADOOP_USER+'/'+SRV+'/'+filename+'/'+filename+'.txt?user.name='+HADOOP_USER
        
        # Create hadoop file if necessary
        if getFileStatus(HADOOP_HOST, NAMENODE[1], path)!=200:
            createFile(HADOOP_HOST, NAMENODE[1], path)

        # Convert database entries to Hadoop column-oriented format and append output to Hadoop file
        for doc in aggr:
            timestamp=doc['_id']['recvTime'].strftime('%Y-%m-%dT%H:%M:%S')+doc['_id']['recvTime'].strftime('.%f')[:4]+'Z'
            timestampDict={'recvTime': timestamp, 'fiwareServicePath': SRV_PATH, 'entityId': entID, 'entityType': entType}
            for entry in doc['entries']:
                timestampDict.update({entry['attrName']: entry['attrValue'], entry['attrName']+'_md': [{'name': 'TimeInstant',
                    'type': 'ISO8601', 'value': timestamp}]})
            colString+=json.dumps(timestampDict)+'\n'
            if len(colString)>1000000:
                appendData(HADOOP_HOST, NAMENODE[1], path, colString)
                colString=''
        if len(colString)>0:
            appendData(HADOOP_HOST, NAMENODE[1], path, colString)

        print 'Collection "'+collection+'" of database "'+DATABASE+'" parsed successfully!'
        print

print 'Finished!'