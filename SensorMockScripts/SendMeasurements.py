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


import requests, json
import ConfigParser
import io
import sys
import time
import random
import codecs

CONFIG_FILE = "./config.ini"

NUM_ARG=len(sys.argv)
COMMAND=sys.argv[0] 

if NUM_ARG==2:
   FILE_NAME=sys.argv[1]
else:
   print 'Usage: '+COMMAND+' [FILE_NAME]'
   print '  Where FILE_NAME = Name of the file containing sensor data (must be in current directory)'
   print '        The file with the sensor data must contain one or more lines in the following format:'
   print '        <DEV_ID>,<API_KEY>,<MEASUREMENT_TYPE>,<VALUE_TYPE>,<VALUE_START>'
   print '          Where DEV_ID = Device ID of your sensor'
   print '                API_KEY = API key for the service used with this device'
   print '                MEASUREMENT_TYPE = Alias for type of measurement, e.g. t for temperature'
   print '                VALUE_TYPE = Type of value, can be int, float or string'
   print '                VALUE_START = Initial value which will be randomly increased/decreased (or sent unchanged, if value is a string)'
   print
   print '        Example: python '+COMMAND+' .\\test-data.txt'
   print
   sys.exit(2)

# Load the configuration file
with open(CONFIG_FILE,'r+') as f:
    sample_config = f.read()
config = ConfigParser.RawConfigParser(allow_no_value=True)
config.readfp(io.BytesIO(sample_config))

IDAS_HOST=config.get('idas', 'host')
IDAS_ADMIN_PORT=config.get('idas', 'adminport')
IDAS_UL20_PORT=config.get('idas', 'ul20port')
FIWARE_SERVICE=config.get('idas', 'fiware_service')
FIWARE_SERVICEPATH=config.get('idas', 'fiware_service_path')

IDAS_AAA=config.get('idas', 'OAuth')
if IDAS_AAA == "yes":
   TOKEN=config.get('user', 'token')
else:
   TOKEN="NULL"

f.close()

# Read the file with sensor data
if FILE_NAME.startswith("./") or FILE_NAME.startswith(".\\"):
    FILE_NAME = FILE_NAME[2:]
with codecs.open('./'+FILE_NAME,'r+','utf-8') as sd:
    lines = sd.readlines()
data = [line.replace(" ","").strip().split(",") for line in lines]

sd.close()

HEADERS = {'content-type': 'text/plain; charset=utf-8' , 'X-Auth-Token' : TOKEN, 'Fiware-Service' : FIWARE_SERVICE, 'Fiware-ServicePath' : FIWARE_SERVICEPATH }

try:
   while True:
      print
      print ">> Press CTRL-C at any time to exit <<"
      for dataset in data:
         SENSOR_ID = dataset[0]
         API_KEY = dataset[1]
         MEASUREMENT_TYPE = dataset[2]
         VALUE_TYPE = dataset[3]
         VALUE_START = dataset[4]
         
         URL = "http://"+IDAS_HOST+":"+IDAS_UL20_PORT+'/iot/d?k='+API_KEY+'&i='+SENSOR_ID

         VALUE = VALUE_START
         if VALUE_TYPE == "int":
            VALUE = int(VALUE) + random.randint(-2, 2)
         elif VALUE_TYPE == "float":
            VALUE = float(VALUE) + random.uniform(-2.0, 2.0)

         dataset[4] = VALUE

         if VALUE_TYPE == "string":
            PAYLOAD = MEASUREMENT_TYPE+'|'+VALUE.encode('utf-8').decode('utf-8')
         else:
            PAYLOAD = MEASUREMENT_TYPE+'|'+str(VALUE)

         print
         print "* SENDING MEASUREMENT OF SENSOR '"+SENSOR_ID+"'"
         print "* Sensor Data: "+PAYLOAD
         r = requests.post(URL, data=PAYLOAD.encode('utf-8'), headers=HEADERS)
         print "* Status Code: "+str(r.status_code)
         
      if VALUE_TYPE == "string":
         break

      time.sleep(5)
except KeyboardInterrupt:
   pass