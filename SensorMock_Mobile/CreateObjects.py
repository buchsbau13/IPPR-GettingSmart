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

NUM_ARG=len(sys.argv)
COMMAND=sys.argv[0] 

if NUM_ARG==3:
    TYPE=sys.argv[1]
    FILE_NAME=sys.argv[2]

else:
    print 'Usage: '+COMMAND+' [TYPE] [FILE_NAME]'
    print '  Where TYPE = Type of object(s) to create, can be ent for entity, srv for services,'
    print '          dev for devices or sub for subscriptions'
    print '        FILE_NAME = Name of the file containing service/entity/device/subscription data'
    print '          in JSON format (must be in current directory)'
    print
    print '        Example: python .\CreateObjects.py ent Lamp_1.txt'
    print
    sys.exit(2)

CONFIG_FILE = "./config.ini"

# Load the configuration file
with open(CONFIG_FILE,'r+') as f:
    sample_config = f.read()
config = ConfigParser.RawConfigParser(allow_no_value=True)
config.readfp(io.BytesIO(sample_config))

IDAS_HOST=config.get('idas', 'host')
IDAS_ADMIN_PORT=config.get('idas', 'adminport')
IDAS_UL20_PORT=config.get('idas', 'ul20port')
IDAS_FIWARE_SERVICE=config.get('idas', 'fiware_service')
IDAS_FIWARE_SERVICEPATH=config.get('idas', 'fiware_service_path')
IDAS_AAA=config.get('idas', 'OAuth')
CB_HOST=config.get('contextbroker', 'host')
CB_PORT=config.get('contextbroker', 'port')
CB_FIWARE_SERVICE=config.get('contextbroker', 'fiware_service')
CB_FIWARE_SERVICEPATH=config.get('contextbroker', 'fiware_service_path')
CB_AAA=config.get('contextbroker', 'OAuth')

if ((TYPE == "srv" or TYPE == "dev") and IDAS_AAA == "yes") or ((TYPE == "ent" or TYPE == "sub") and CB_AAA == "yes"):
    TOKEN=config.get('user', 'token')
    TOKEN_SHOW=TOKEN[1:5]+"**********************************************************************"+TOKEN[-5:]
else:
    TOKEN="NULL"
    TOKEN_SHOW="NULL"

f.close()

if TYPE == "ent" or TYPE == "sub":
    if TYPE == "ent":
        URL = "http://"+CB_HOST+":"+CB_PORT+'/v2/entities'
    else:
        URL = "http://"+CB_HOST+":"+CB_PORT+'/v1/subscribeContext'
    HEADERS = {'content-type': 'application/json','accept': 'application/json', 'Fiware-Service': CB_FIWARE_SERVICE ,'Fiware-ServicePath': CB_FIWARE_SERVICEPATH,'X-Auth-Token' : TOKEN}
    HEADERS_SHOW = {'content-type': 'application/json', 'accept': 'application/json' , 'Fiware-Service': CB_FIWARE_SERVICE ,'Fiware-ServicePath': CB_FIWARE_SERVICEPATH , 'X-Auth-Token' : TOKEN_SHOW}
else:
    if TYPE == "dev":
        URL = "http://"+IDAS_HOST+":"+IDAS_ADMIN_PORT+'/iot/devices'
    else:
        URL = "http://"+IDAS_HOST+":"+IDAS_ADMIN_PORT+'/iot/services'
    HEADERS = {'content-type': 'application/json' , 'X-Auth-Token' : TOKEN, 'Fiware-Service' : IDAS_FIWARE_SERVICE, 'Fiware-ServicePath' : IDAS_FIWARE_SERVICEPATH}
    HEADERS_SHOW = {'content-type': 'application/json' , 'X-Auth-Token' : TOKEN_SHOW, 'Fiware-Service' : IDAS_FIWARE_SERVICE, 'Fiware-ServicePath' : IDAS_FIWARE_SERVICEPATH}

# Load the entity data file
with open('./'+FILE_NAME,'r+') as ed:
    PAYLOAD = ed.read()
    
ed.close()

if TYPE == "ent":
    OBJECT = "entity"
elif TYPE == "sub":
    OBJECT = "subscription"
elif TYPE == "srv":
    OBJECT = "service"
else:
    OBJECT = "device"

print "* Sending "+OBJECT+" PAYLOAD: "
print json.dumps(json.loads(PAYLOAD), indent=4)
print
r = requests.post(URL, data=PAYLOAD, headers=HEADERS)
print "* Status Code: "+str(r.status_code)
print

