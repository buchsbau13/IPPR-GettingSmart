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

import requests, json
import ConfigParser
import io
import sys
import time

CONFIG_FILE = "./config.ini"

NUM_ARG=len(sys.argv)
COMMAND=sys.argv[0] 

if NUM_ARG==2:
    FILE_NAME=sys.argv[1]

else:
    print 'Usage: '+COMMAND+' [FILE_NAME]'
    print '  Where FILE_NAME = Name of the file containing subscription data (must be in current directory)'
    print '        The file with the subscription data must contain one or more lines in the following format:'
    print '        <ENTITY_ID>,<ENTITY_TYPE>,<ATTRIBUTE>'
    print '          Where ENTITY_ID = ID of the entity containing sensors'
    print '                ENTITY_TYPE = Type of the entity'
    print '                ATTRIBUTE = Attribute that should be monitored by the subscription, e.g. temperature'
    print
    print '        Example: python '+COMMAND+' .\\subscriptions.txt'
    print
    sys.exit(2)

# Load the configuration file
with open(CONFIG_FILE,'r+') as f:
    sample_config = f.read()
config = ConfigParser.RawConfigParser(allow_no_value=True)
config.readfp(io.BytesIO(sample_config))

CB_HOST=config.get('contextbroker', 'host')
CB_PORT=config.get('contextbroker', 'port')
CB_FIWARE_SERVICE=config.get('contextbroker', 'fiware_service')
CB_FIWARE_SERVICEPATH=config.get('contextbroker', 'fiware_service_path')
CYG_HOST=config.get('cygnus', 'host')
CYG_PORT=config.get('cygnus', 'port')

CB_AAA=config.get('contextbroker', 'OAuth')
if CB_AAA == "yes":
    TOKEN=config.get('user', 'token')
    TOKEN_SHOW=TOKEN[1:5]+"**********************************************************************"+TOKEN[-5:]
else:
    TOKEN="NULL"
    TOKEN_SHOW="NULL"

f.close()

CB_URL = "http://"+CB_HOST+":"+CB_PORT
SERVER_URL = "http://"+CYG_HOST+":"+CYG_PORT+"/notify"

# Read the file with subscription data
if FILE_NAME.startswith("./") or FILE_NAME.startswith(".\\"):
    FILE_NAME = FILE_NAME[2:]
with open('./'+FILE_NAME,'r+') as sd:
    lines = sd.readlines()
data = [line.replace(" ","").strip().split(",") for line in lines]

sd.close()

MIN_INTERVAL = "PT1S"
DURATION = "P10Y"

HEADERS = {'content-type': 'application/json','accept': 'application/json', 'Fiware-Service': CB_FIWARE_SERVICE ,'Fiware-ServicePath': CB_FIWARE_SERVICEPATH,'X-Auth-Token' : TOKEN}
HEADERS_SHOW = {'content-type': 'application/json', 'accept': 'application/json' , 'Fiware-Service': CB_FIWARE_SERVICE ,'Fiware-ServicePath': CB_FIWARE_SERVICEPATH , 'X-Auth-Token' : TOKEN_SHOW}

URL = CB_URL + '/v1/subscribeContext'

for dataset in data:
    ENTITY_ID = dataset[0]
    ENTITY_TYPE = dataset[1]
    ENTITY_ATTR = dataset[2]
    ENTITY_ATTR_WATCH = ENTITY_ATTR
    ENTITY_ATTR_NOTIFY = ENTITY_ATTR

    PAYLOAD = '{ \
        "entities": [ \
            { \
                "type": "'+ENTITY_TYPE+'", \
                "isPattern": "false", \
                "id": "'+ENTITY_ID+'" \
            } \
        ], \
        "attributes": [ \
            "'+ENTITY_ATTR_NOTIFY+'" \
        ], \
        "reference": "'+SERVER_URL+'", \
        "duration": "'+DURATION+'", \
        "notifyConditions": [ \
            { \
                "type": "ONCHANGE", \
                "condValues": [ \
                    "'+ENTITY_ATTR_WATCH+'" \
                ] \
            } \
        ], \
        "throttling": "'+MIN_INTERVAL+'" \
    }' 

    print "* Creating subscription for entity '"+ENTITY_ID+"' and attribute '"+ENTITY_ATTR+"'..."
    r = requests.post(URL, data=PAYLOAD, headers=HEADERS)
    print "* Status Code: "+str(r.status_code)
    print
    
    time.sleep(0.5)