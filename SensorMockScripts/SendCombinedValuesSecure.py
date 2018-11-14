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
import base64

CONFIG_FILE = "./config_secure.ini"

NUM_ARG=len(sys.argv)
COMMAND=sys.argv[0]

def sendValues(payload):
   URL = IDAS_PROTO+'://'+IDAS_HOST+':'+IDAS_UL20_PORT+'/iot/d/'+API_KEY+'/'+SENSOR_ID
   HEADERS = {'content-type': 'text/plain', 'X-Auth-Token' : TOKEN, 'Fiware-Service' : FIWARE_SERVICE, 'Fiware-ServicePath' : FIWARE_SERVICEPATH }
   print "* SENDING VALUES OF SENSOR '"+SENSOR_ID+"'"
   print "* USING TOKEN '"+TOKEN+"'"
   print "* Payload: "+payload
   r = requests.post(URL, data=payload, headers=HEADERS, timeout=2)
   print "* Status Code: "+str(r.status_code)
   return r.status_code

def fetchToken():
   TOKEN_URL = KEYROCK_PROTO+'://'+KEYROCK_HOST+':'+KEYROCK_PORT+'/oauth2/token'
   TOKEN_HEADERS = {'content-type': 'application/x-www-form-urlencoded', 'authorization': 'Basic '+AUTH_HEADER}
   TOKEN_PAYLOAD = {'grant_type': 'password', 'username': USERNAME, 'password': PASSWORD}
   print "* FETCHING VALID OAuth2 TOKEN..."
   r = requests.post(TOKEN_URL, data=TOKEN_PAYLOAD, headers=TOKEN_HEADERS)
   print "* Token: "+r.json()['access_token']
   return r.json()['access_token']

if NUM_ARG==6:
   SENSOR_ID=sys.argv[1]
   API_KEY=sys.argv[2]
   USERNAME=sys.argv[3]
   PASSWORD=sys.argv[4]
   FILE_NAME=sys.argv[5]
else:
   print 'Usage: '+COMMAND+' [DEV_ID] [API_KEY] [USERNAME] [PASSWORD] [FILE_NAME]'
   print '  Where DEV_ID = Device ID of your sensor'
   print '        API_KEY = API key for the service used with this device'
   print '        USERNAME = Username for acquiring an OAuth2 token'
   print '        PASSWORD = Password for acquiring an OAuth2 token'
   print '        FILE_NAME = Name of the file containing values to send (must be in current directory)'
   print '        The file with the values must contain one or more lines in the following format:'
   print '        <ALIAS_1>|<VALUE_1>|<ALIAS_2>|<VALUE_2> etc.'
   print '          Where ALIAS_x = Alias for type of measurement, e.g. t for temperature'
   print '                VALUE_x = Value of the corresponding measurement'
   print
   print '        Example: python '+COMMAND+' Dev_Bus_1 apitest user@mail.com Pa$$w0rd .\\bus_1-values.txt'
   print
   sys.exit(2)

# Load the configuration file
with open(CONFIG_FILE,'r+') as f:
    sample_config = f.read()
config = ConfigParser.RawConfigParser(allow_no_value=True)
config.readfp(io.BytesIO(sample_config))

IDAS_PROTO=config.get('idas', 'proto')
IDAS_HOST=config.get('idas', 'host')
IDAS_UL20_PORT=config.get('idas', 'ul20port_secure')
KEYROCK_PROTO=config.get('idm', 'proto')
KEYROCK_HOST=config.get('idm', 'host')
KEYROCK_PORT=config.get('idm', 'port')
AUTH_HEADER=base64.b64encode((config.get('idm', 'client_id')+':'+config.get('idm', 'client_secret')).encode()).decode('UTF-8')
TOKEN='invalid_token'

FIWARE_SERVICE=config.get('idas', 'fiware_service')
FIWARE_SERVICEPATH=config.get('idas', 'fiware_service_path')

f.close()

# Read the file with coordinates
if FILE_NAME.startswith("./") or FILE_NAME.startswith(".\\"):
    FILE_NAME = FILE_NAME[2:]
with open('./'+FILE_NAME,'r+') as cd:
    lines = cd.readlines()
data = [line.replace(" ","").strip() for line in lines]

cd.close()

try:
   while True:
      print
      print ">> Press CTRL-C at any time to exit <<"
      for dataset in data:
         print

         try:
            if TOKEN == 'invalid_token':
               TOKEN = fetchToken()
               print
            status = sendValues(dataset)
            if status == 401:
               print
               print "!!! TOKEN INVALID OR USER NOT AUTHORISED. RETRYING..."
               print
               TOKEN = fetchToken()
               print
               sendValues(dataset)
         except requests.exceptions.ReadTimeout:
            print
            print "!!! CONNECTION TIMED OUT. RETRYING..."
            print
            fetchToken()
            print
            sendValues(dataset)

         time.sleep(2)
except KeyboardInterrupt:
   pass
