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


import requests, json
import ConfigParser
import io
import sys
import time

CONFIG_FILE = "./config.ini"

NUM_ARG=len(sys.argv)
COMMAND=sys.argv[0] 

if NUM_ARG==4:
   SENSOR_ID=sys.argv[1]
   API_KEY=sys.argv[2]
   FILE_NAME=sys.argv[3]
else:
   print 'Usage: '+COMMAND+' [DEV_ID] [API_KEY] [FILE_NAME]'
   print '  Where DEV_ID = Device ID of your sensor'
   print '        API_KEY = API key for the service used with this device'
   print '        FILE_NAME = Name of the file containing values to send (must be in current directory)'
   print '        The file with the values must contain one or more lines in the following format:'
   print '        <ALIAS_1>|<VALUE_1>|<ALIAS_2>|<VALUE_2> etc.'
   print '          Where ALIAS_x = Alias for type of measurement, e.g. t for temperature'
   print '                VALUE_x = Value of the corresponding measurement'
   print
   print '        Example: python '+COMMAND+' Dev_Bus_1 apimobile .\\bus_1-values.txt'
   print
   sys.exit(2)

# Load the configuration file
with open(CONFIG_FILE,'r+') as f:
    sample_config = f.read()
config = ConfigParser.RawConfigParser(allow_no_value=True)
config.readfp(io.BytesIO(sample_config))

IDAS_HOST=config.get('idas', 'host')
IDAS_UL20_PORT=config.get('idas', 'ul20port')
FIWARE_SERVICE=config.get('idas', 'fiware_service')
FIWARE_SERVICEPATH=config.get('idas', 'fiware_service_path')

IDAS_AAA=config.get('idas', 'OAuth')
if IDAS_AAA == "yes":
   TOKEN=config.get('user', 'token')
else:
   TOKEN="NULL"

f.close()

# Read the file with coordinates
if FILE_NAME.startswith("./") or FILE_NAME.startswith(".\\"):
    FILE_NAME = FILE_NAME[2:]
with open('./'+FILE_NAME,'r+') as cd:
    lines = cd.readlines()
data = [line.replace(" ","").strip() for line in lines]

cd.close()

URL = 'http://'+IDAS_HOST+':'+IDAS_UL20_PORT+'/iot/d?k='+API_KEY+'&i='+SENSOR_ID

HEADERS = {'content-type': 'text/plain' , 'X-Auth-Token' : TOKEN, 'Fiware-Service' : FIWARE_SERVICE, 'Fiware-ServicePath' : FIWARE_SERVICEPATH }

try:
   while True:
      print
      print ">> Press CTRL-C at any time to exit <<"
      for dataset in data:
         PAYLOAD = dataset

         print
         print "* SENDING VALUES OF SENSOR '"+SENSOR_ID+"'"
         print "* Payload: "+PAYLOAD
         r = requests.post(URL, data=PAYLOAD, headers=HEADERS)
         print "* Status Code: "+str(r.status_code)

         time.sleep(5)
except KeyboardInterrupt:
   pass
