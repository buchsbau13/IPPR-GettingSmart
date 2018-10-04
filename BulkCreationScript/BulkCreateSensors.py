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

import json
import ConfigParser
import io
import sys
import random

CONFIG_FILE='./settings.ini'

NUM_ARG=len(sys.argv)
COMMAND=sys.argv[0] 

if NUM_ARG!=1:
   print 'Usage: '+COMMAND
   print '  Configure the preferences in the file "settings.ini".'
   print '  List of available settings:'
   print '        url = Destination URL for subscription notifications'
   print '        prefix = Prefix for sensor ID and name (e.g. Test_Sensor_)'
   print '        firstNum = Start the list of generated sensors with this number (e.g. 1)'
   print '        lastNum = End the list of generated sensors with this number (e.g. 100)'
   print '        type = Type of generated sensors (e.g. test)'
   print '        devAttrs = Comma separated list of device attributes in the format'
   print '                   <handle>/<name>/<data_type> (e.g. t/temperature/Float,h/humidity/Float)'
   print
   print '        -> The script generates entities, devices and subscriptions for the sensors with IDs'
   print '           <prefix><firstNum> until <prefix><lastNum> (e.g. Test_Sensor_1 to Test_Sensor_100)'

   print
   sys.exit(2)

# Read the configuration file
with open(CONFIG_FILE,'r+') as f:
    sample_config=f.read()
config=ConfigParser.RawConfigParser(allow_no_value=True)
config.readfp(io.BytesIO(sample_config))

CYGNUS=config.get('cygnus', 'url')
PREFIX=config.get('sensors', 'prefix')
FIRSTNUM=config.get('sensors', 'firstNum')
LASTNUM=config.get('sensors', 'lastNum')
TYPE=config.get('sensors', 'type')
ATTRS=config.get('sensors', 'devAttrs')

# Define coordinate boundaries
MINLAT=47.2
MAXLAT=48.2
MINLON=13.3
MAXLON=16.3

# Function for writing JSON to file
def writeJSON(data, file):
    with open(file, 'w') as outfile:
        outfile.write(json.dumps(data, indent=2))

# Generate attribute list
attrList=[]
for entry in ATTRS.split(','):
    attrData=entry.split('/')
    attrList.append({'object_id': attrData[0], 'name': attrData[1], 'type': attrData[2]})

# Create entity, device and subscription lists
entJSON={'entities': []}
devJSON={'devices': []}
subJSON={'subscriptions': []}

for cnt in range(int(FIRSTNUM), int(LASTNUM)+1):
    sensor=PREFIX+str(cnt)
    coords=str(round(random.uniform(MINLAT,MAXLAT), 6))+','+str(round(random.uniform(MINLON,MAXLON), 6))
    entJSON['entities'].append({'id': sensor, 'type': TYPE, 'name': {'value': sensor}, 'location': {'type': 'geo:point', 'value': coords}})
    devJSON['devices'].append({'device_id': 'Dev_'+sensor, 'entity_name': sensor, 'entity_type': TYPE, 'timezone': 'Europe/Vienna', 'attributes': attrList})
    for attr in attrList:
        subJSON['subscriptions'].append({'subject': {'entities': [{'id': sensor, 'type': TYPE}], 'condition': {'attrs': [attr['name']]}},\
            'notification': {'http': {'url': CYGNUS}, 'attrs': [attr['name']], 'attrsFormat': 'legacy'}, 'throttling': 3})

# Write generated lists to files
writeJSON(entJSON, 'entities-'+PREFIX+FIRSTNUM+'-'+LASTNUM+'.json')
writeJSON(devJSON, 'devices-'+PREFIX+FIRSTNUM+'-'+LASTNUM+'.json')
writeJSON(subJSON, 'subscriptions-'+PREFIX+FIRSTNUM+'-'+LASTNUM+'.json')
print
print '+++ Entities, devices and subscriptions for sensors "'+PREFIX+FIRSTNUM+'" through "'+PREFIX+LASTNUM+'" created successfully!'
print