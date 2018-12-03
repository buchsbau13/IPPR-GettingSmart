#!/usr/bin/env python
# -*- coding: utf-8 -*-

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
import codecs

CONFIG_FILE='./config.ini'

NUM_ARG=len(sys.argv)
COMMAND=sys.argv[0] 

if NUM_ARG!=1:
   print 'Usage: '+COMMAND
   print '  Configure the preferences in the file "config.ini".'
   print '  List of available settings:'
   print '        url = Destination URL for subscription notifications'
   print '        prefix = Prefix for sensor ID and name (e.g. Test_Sensor_)'
   print '        firstNum = Start the list of generated sensors with this number (e.g. 1)'
   print '        lastNum = End the list of generated sensors with this number (e.g. 100)'
   print '        type = Type of generated sensors (e.g. test)'
   print '        devAttrs = Comma separated list of device attributes in the format'
   print '                   <handle>/<name>/<data_type> (e.g. t/temperature/Float,h/humidity/Float)'
   print '        attrUnits = Comma separated list of attribute units in the format'
   print '                   <unit_name>=<unit_value> (e.g. temp_sensor_unit=°C,humid_sensor_unit=%)'
   print
   print '        -> The script generates entities, devices and subscriptions for the sensors with IDs'
   print '           <prefix><firstNum> until <prefix><lastNum> (e.g. Test_Sensor_1 to Test_Sensor_100)'

   print
   sys.exit(2)

# Read the configuration file
config=ConfigParser.RawConfigParser(allow_no_value=True)
config.readfp(codecs.open(CONFIG_FILE,'r+','utf-8'))

CYGNUS=config.get('cygnus', 'url')
PREFIX=config.get('sensors', 'prefix')
FIRSTNUM=config.get('sensors', 'firstNum')
LASTNUM=config.get('sensors', 'lastNum')
TYPE=config.get('sensors', 'type')
ATTRS=config.get('sensors', 'devAttrs')
UNITS=config.get('sensors', 'attrUnits')

# Define coordinate boundaries
MINLAT=47.2
MAXLAT=48.2
MINLON=13.3
MAXLON=16.3

# Function for writing JSON to file
def writeJSON(data, file):
    with open(file, 'w') as outfile:
        outfile.write(json.dumps(data, indent=2, ensure_ascii=False).encode('utf-8'))

# Generate attribute list
attrList=[]
for entry in ATTRS.split(','):
    attrData=entry.split('/')
    attrList.append({'object_id': attrData[0], 'name': attrData[1], 'type': attrData[2]})

# Generate unit list
unitList=[]
for data in UNITS.split(','):
    unitData=data.split('=')
    unitList.append({'name': unitData[0], 'value': unitData[1]})

# Create entity, device and subscription lists
entJSON={'entities': []}
devJSON={'devices': []}
subJSON={'subscriptions': []}

for cnt in range(int(FIRSTNUM), int(LASTNUM)+1):
    sensor=PREFIX+str(cnt)
    coords=str(round(random.uniform(MINLAT,MAXLAT), 6))+','+str(round(random.uniform(MINLON,MAXLON), 6))
    entity={'id': sensor, 'type': TYPE, 'name': {'value': sensor}, 'location': {'type': 'geo:point', 'value': coords}}
    for unit in unitList:
        entity[unit['name']]={'value': unit['value']}
    entJSON['entities'].append(entity)
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