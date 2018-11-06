#!/usr/bin/env python
# -*- coding: utf-8 -*-

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

import requests
import json
import ConfigParser
import io
import sys
import codecs
import base64

NUM_ARG=len(sys.argv)
COMMAND=sys.argv[0] 

def fetchToken():
    TOKEN_URL = IDM_PROTO+'://'+IDM_HOST+':'+IDM_PORT+'/oauth2/token'
    TOKEN_HEADERS = {'content-type': 'application/x-www-form-urlencoded', 'authorization': 'Basic '+AUTH_HEADER}
    TOKEN_PAYLOAD = {'grant_type': 'password', 'username': USERNAME, 'password': PASSWORD}
    print "* FETCHING VALID OAuth2 TOKEN..."
    r = requests.post(TOKEN_URL, data=TOKEN_PAYLOAD, headers=TOKEN_HEADERS)
    print "* Token: "+r.json()['access_token']
    return r.json()['access_token']

def getSubscriptions(page):
    URL=ORION_PROTO+'://'+ORION_HOST+':'+ORION_PORT+'/v2/subscriptions?limit=1000&options=count&offset='+str(page*1000)
    r = requests.get(URL, headers=HEADERS)
    SUB_LIST.extend(r.json())
    # Call this function until all subscriptions have been fetched (max 1000000)
    if page<1000 and (page+1)*1000<int(r.headers['fiware-total-count']):
        getSubscriptions(page+1)

def filterSubscriptions(data):
    getSubscriptions(0)
    for entry in data['subscriptions']:
        for sub in SUB_LIST:
            entMatch=False
            attrMatch=False
            filterEnt=entry['subject']['entities'][0]
            filterAttrs=entry['subject']['condition']['attrs']
            for ent in sub['subject']['entities']:
                if ent['id']==filterEnt['id'] and ent['type']==filterEnt['type']:
                    entMatch=True
                    break
            for attr in sub['subject']['condition']['attrs']:
                if attr in filterAttrs:
                    attrMatch=True
                    break
            if entMatch and attrMatch:
                SUB_FILTER_LIST.append(sub)

def addDelServices(data):
    URL=IDAS_PROTO+'://'+IDAS_HOST+':'+IDAS_PORT+'/iot/services'
    success=0
    failure=0
    if MODE=='add':
        print 'Adding '+str(len(data['services']))+' new services...'
        print
        for srv in data['services']:
            payload={'services': [srv]}
            r=requests.post(URL, data=json.dumps(payload, ensure_ascii=False).encode('utf-8'), headers=HEAD_CONTENT)
            # If security token has expired, renew token and retry
            if r.status_code==401:
                TOKEN=fetchToken()
                HEADERS['X-Auth-Token']=TOKEN
                HEAD_CONTENT['X-Auth-Token']=TOKEN
                r=requests.post(URL, data=json.dumps(payload, ensure_ascii=False).encode('utf-8'), headers=HEAD_CONTENT)
            if r.status_code==201:
                success+=1
            else:
                failure+=1
        if success>0:
            print str(success)+' services added successfully!'
        if failure>0:
            print str(failure)+' services could not be added!'
    elif MODE=='del':
        print 'Deleting '+str(len(data['services']))+' services...'
        print
        for srv in data['services']:
            parameters={'apikey': srv['apikey'], 'resource': srv['resource']}
            r=requests.delete(URL, params=parameters, headers=HEAD_CONTENT, timeout=1)
            # If security token has expired, renew token and retry
            if r.status_code==401:
                TOKEN=fetchToken()
                HEADERS['X-Auth-Token']=TOKEN
                HEAD_CONTENT['X-Auth-Token']=TOKEN
                r=requests.delete(URL, params=parameters, headers=HEAD_CONTENT, timeout=1)
            if r.status_code==204:
                success+=1
            else:
                failure+=1
        if success>0:
            print str(success)+' services deleted successfully!'
        if failure>0:
            print str(failure)+' services could not be deleted!'

def addDelEntities(data):
    URL=ORION_PROTO+'://'+ORION_HOST+':'+ORION_PORT+'/v2/entities'
    success=0
    failure=0
    if MODE=='add':
        print 'Adding '+str(len(data['entities']))+' new entities...'
        print
        for ent in data['entities']:
            r=requests.post(URL, data=json.dumps(ent, ensure_ascii=False).encode('utf-8'), headers=HEAD_CONTENT)
            # If security token has expired, renew token and retry
            if r.status_code==401:
                TOKEN=fetchToken()
                HEADERS['X-Auth-Token']=TOKEN
                HEAD_CONTENT['X-Auth-Token']=TOKEN
                r=requests.post(URL, data=json.dumps(ent, ensure_ascii=False).encode('utf-8'), headers=HEAD_CONTENT)
            if r.status_code==201:
                success+=1
            else:
                failure+=1
        if success>0:
            print str(success)+' entities added successfully!'
        if failure>0:
            print str(failure)+' entities could not be added!'
    elif MODE=='del':
        print 'Deleting '+str(len(data['entities']))+' entities...'
        print
        for ent in data['entities']:
            path=URL+'/'+ent['id']+'?type='+ent['type']
            r=requests.delete(path, headers=HEADERS, timeout=1)
            # If security token has expired, renew token and retry
            if r.status_code==401:
                TOKEN=fetchToken()
                HEADERS['X-Auth-Token']=TOKEN
                HEAD_CONTENT['X-Auth-Token']=TOKEN
                r=requests.delete(path, headers=HEADERS, timeout=1)
            if r.status_code==204:
                success+=1
            else:
                failure+=1
        if success>0:
            print str(success)+' entities deleted successfully!'
        if failure>0:
            print str(failure)+' entities could not be deleted!'

def addDelDevices(data):
    URL=IDAS_PROTO+'://'+IDAS_HOST+':'+IDAS_PORT+'/iot/devices'
    success=0
    failure=0
    if MODE=='add':
        print 'Adding '+str(len(data['devices']))+' new devices...'
        print
        for dev in data['devices']:
            payload={'devices': [dev]}
            r=requests.post(URL, data=json.dumps(payload, ensure_ascii=False).encode('utf-8'), headers=HEAD_CONTENT)
            # If security token has expired, renew token and retry
            if r.status_code==401:
                TOKEN=fetchToken()
                HEADERS['X-Auth-Token']=TOKEN
                HEAD_CONTENT['X-Auth-Token']=TOKEN
                r=requests.post(URL, data=json.dumps(payload, ensure_ascii=False).encode('utf-8'), headers=HEAD_CONTENT)
            if r.status_code==201:
                success+=1
            else:
                failure+=1
        if success>0:
            print str(success)+' devices added successfully!'
        if failure>0:
            print str(failure)+' devices could not be added!'
    elif MODE=='del':
        print 'Deleting '+str(len(data['devices']))+' devices...'
        print
        for dev in data['devices']:
            path=URL+'/'+dev['device_id']
            r=requests.delete(path, headers=HEAD_CONTENT, timeout=1)
            # If security token has expired, renew token and retry
            if r.status_code==401:
                TOKEN=fetchToken()
                HEADERS['X-Auth-Token']=TOKEN
                HEAD_CONTENT['X-Auth-Token']=TOKEN
                r=requests.delete(path, headers=HEAD_CONTENT, timeout=1)
            if r.status_code==204:
                success+=1
            else:
                failure+=1
        if success>0:
            print str(success)+' devices deleted successfully!'
        if failure>0:
            print str(failure)+' devices could not be deleted!'

def addDelSubscriptions(data):
    URL=ORION_PROTO+'://'+ORION_HOST+':'+ORION_PORT+'/v2/subscriptions'
    success=0
    failure=0
    if MODE=='add':
        print 'Adding '+str(len(data['subscriptions']))+' new subscriptions...'
        print
        for sub in data['subscriptions']:
            r=requests.post(URL, data=json.dumps(sub, ensure_ascii=False).encode('utf-8'), headers=HEAD_CONTENT)
            # If security token has expired, renew token and retry
            if r.status_code==401:
                TOKEN=fetchToken()
                HEADERS['X-Auth-Token']=TOKEN
                HEAD_CONTENT['X-Auth-Token']=TOKEN
                r=requests.post(URL, data=json.dumps(sub, ensure_ascii=False).encode('utf-8'), headers=HEAD_CONTENT)
            if r.status_code==201:
                success+=1
            else:
                failure+=1
        if success>0:
            print str(success)+' subscriptions added successfully!'
        if failure>0:
            print str(failure)+' subscriptions could not be added!'
    elif MODE=='del':
        print 'Deleting '+str(len(data['subscriptions']))+' subscriptions...'
        print
        filterSubscriptions(data)
        for sub in SUB_FILTER_LIST:
            path=URL+'/'+sub['id']
            r=requests.delete(path, headers=HEADERS, timeout=1)
            # If security token has expired, renew token and retry
            if r.status_code==401:
                TOKEN=fetchToken()
                HEADERS['X-Auth-Token']=TOKEN
                HEAD_CONTENT['X-Auth-Token']=TOKEN
                r=requests.delete(path, headers=HEADERS, timeout=1)
            if r.status_code==204:
                success+=1
            else:
                failure+=1
        if success>0:
            print str(success)+' subscriptions deleted successfully!'
        if failure>0:
            print str(failure)+' subscriptions could not be deleted!'
        

if NUM_ARG==3:
    MODE=sys.argv[1]
    FILE_NAME=sys.argv[2]
else:
    print 'Usage: '+COMMAND+' [MODE] [FILE_NAME]'
    print '  Where MODE = Operation mode of the command ("add" to create and "del" to remove objects)'
    print '        FILE_NAME = Name of the file containing service/entity/device/subscription data'
    print '          in JSON format'
    print
    print '        Example: python '+COMMAND+' add .\\entities.json'
    print
    sys.exit(2)

CONFIG_FILE = "./config.ini"

# Load the configuration file
with open(CONFIG_FILE,'r+') as f:
    sample_config = f.read()
config = ConfigParser.RawConfigParser(allow_no_value=True)
config.readfp(io.BytesIO(sample_config))

IDAS_PROTO=config.get('idas', 'proto')
IDAS_HOST=config.get('idas', 'host')
IDAS_PORT=config.get('idas', 'port')
ORION_PROTO=config.get('contextbroker', 'proto')
ORION_HOST=config.get('contextbroker', 'host')
ORION_PORT=config.get('contextbroker', 'port')
FIWARE_SERVICE=config.get('service', 'fiware_service')
FIWARE_SERVICEPATH=config.get('service', 'fiware_service_path')

SECURE=config.get('idm', 'active')
IDM_PROTO=config.get('idm', 'proto')
IDM_HOST=config.get('idm', 'host')
IDM_PORT=config.get('idm', 'port')
USERNAME=config.get('idm', 'user')
PASSWORD=config.get('idm', 'password')
AUTH_HEADER=base64.b64encode((config.get('idm', 'client_id')+':'+config.get('idm', 'client_secret')).encode()).decode('UTF-8')
TOKEN='invalid_token'

# Load the object data file
if FILE_NAME.startswith("./") or FILE_NAME.startswith(".\\"):
    FILE_NAME = FILE_NAME[2:]
with codecs.open('./'+FILE_NAME,'r+','utf-8') as od:
    JSON = json.load(od)

HEADERS={'Fiware-Service' : FIWARE_SERVICE, 'Fiware-ServicePath' : FIWARE_SERVICEPATH}
HEAD_CONTENT={'Content-Type': 'application/json', 'Fiware-Service' : FIWARE_SERVICE, 'Fiware-ServicePath' : FIWARE_SERVICEPATH}

SUB_LIST=[]
SUB_FILTER_LIST=[]

if SECURE.lower()=='true':
    TOKEN=fetchToken()
    HEADERS['X-Auth-Token']=TOKEN
    HEAD_CONTENT['X-Auth-Token']=TOKEN

if 'services' in JSON:
    addDelServices(JSON)
elif 'entities' in JSON:
    addDelEntities(JSON)
elif 'devices' in JSON:
    addDelDevices(JSON)
elif 'subscriptions' in JSON:
    addDelSubscriptions(JSON)
