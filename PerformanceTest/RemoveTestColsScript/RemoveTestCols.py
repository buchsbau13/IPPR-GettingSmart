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
import time
import pymongo

CONFIG_FILE='./config.ini'

NUM_ARG=len(sys.argv)
COMMAND=sys.argv[0]

if NUM_ARG!=1:
    print 'Usage: '+COMMAND
    print '  Configure the preferences in the file "config.ini".'
    print '  List of available settings:'
    print '        host = Host of the MongoDB instance'
    print '        port = Port of the MongoDB instance'
    print '        database = Name of the database with STH collections'
    print '        prefix = Prefix for sensor IDs (e.g. Test_Sensor_)'
    print '        type = Type of sensors (e.g. test)'
    print '        firstNum = Number of first sensor ID (e.g. 1)'
    print '        lastNum = Number of last sensor ID (e.g. 100)'
    print
    print '        -> The script connects to the configured MongoDB instance and deletes the collections'
    print '           with STH data of all test sensors'

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
PREFIX=config.get('mongo', 'prefix')
TYPE=config.get('mongo', 'type')
START=config.get('mongo', 'firstNum')
END=config.get('mongo', 'lastNum')

# Connect to MongoDB
mongo=pymongo.MongoClient(HOST,int(PORT))
db=mongo[DATABASE]

for cnt in range(int(START), int(END)+1):
    collection='sth_x002fxffff'+PREFIX+str(cnt)+'xffff'+TYPE
    print 'Dropping collection "'+collection+'"'
    print
    try:
        db.drop_collection(collection)
    # Handle potential AutoReconnect exception
    except pymongo.errors.AutoReconnect:
        time.sleep(2)

mongo.close()
print 'Finished!'