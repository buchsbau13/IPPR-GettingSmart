#!/usr/bin/env python

# Copyright 2014 Telefonica Investigacion y Desarrollo, S.A.U
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
# Developed by Carlos Ralli Ucendo (@carlosralli), Nov 2014.
# New Features added/developped by Easy Global Market, Nov 2015 abbas.ahmad@eglobalmark.com 

import json
import sys

NUM_ARG=len(sys.argv)
COMMAND=sys.argv[0] 

if NUM_ARG==5:
    ENT_ID=sys.argv[1]
    ENT_TYPE=sys.argv[2]
    SRV_PATH=sys.argv[3]
    FILE_NAME=sys.argv[4]
else:
    print 'Usage: '+COMMAND+' [ENTITY_ID] [ENTITY_TYPE] [SERVICE_PATH] [FILE_NAME]'
    print '  Where ENTITY_ID = Entity ID of sensor'
    print '        ENTITY_TYPE = Entity type of sensor'
    print '        SERVICE_PATH = FIWARE service path for the sensor'
    print '        FILE_NAME = Name of the file containing historic sensor data of MongoDB'
    print '          in JSON format'
    print
    print '        Example: python '+COMMAND+' Bus_1 mobile / .\\bus_1.json'
    print
    sys.exit(2)

# Open input and output files
mongoFile=open(FILE_NAME, 'r')
hadoopFile=open(ENT_ID+'-'+ENT_TYPE+'-hadoop_col.json', 'w')

dbDict={}

print 'Parsing MongoDB data...'

for line in mongoFile:
    try:
        jsonLine=json.loads(line)
    except ValueError:
        continue

    if jsonLine['recvTime']['$date'] not in dbDict:
        dbDict[jsonLine['recvTime']['$date']]={}
    dbDict[jsonLine['recvTime']['$date']].update({jsonLine['attrName']: jsonLine['attrValue'],
        jsonLine['attrName']+'_md': [{'name': 'TimeInstant', 'type': 'ISO8601', 'value': jsonLine['recvTime']['$date']}]})

for timestamp in dbDict:
    outputJSON={'recvTime': timestamp, 'fiwareServicePath': SRV_PATH, 'entityId': ENT_ID, 'entityType': ENT_TYPE}
    outputJSON.update(dbDict[timestamp])
    hadoopFile.write(json.dumps(outputJSON)+'\n')

print 'Parsing completed!'
mongoFile.close()
hadoopFile.close()