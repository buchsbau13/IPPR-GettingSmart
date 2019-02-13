#!/usr/bin/python -u
# -*- coding: utf-8 -*-

import serial, requests, json, base64, time, sys, signal, Adafruit_DHT


# Delay between transmissions of sensor measurements (in seconds)
SENSOR_TIMEOUT = 15

# Settings for communicating with the FIWARE IoT agent
HOST = "http://192.168.1.129:7896"
DEVICE_ID = "Dev_RasPi_1"
API_KEY = "apistatic"
FIWARE_SERVICE = "graziot"
FIWARE_SERVICE_PATH = "/"

# Authentication settings (set AUTH_ENABLED to False if not needed)
AUTH_ENABLED = True
AUTH_HOST = "http://192.168.1.129:5000"
USERNAME = "michi_janusch@chello.at"
PASSWORD = "IPPR_aim17"
CLIENT_ID = "cc6a2ff9-303c-4f15-baf9-871e7abba7e9"
CLIENT_SECRET = "3c963ba8-35f4-45b7-b677-143988520f8d"


# Path to serial port device
SERIAL_PORT_AIR = "/dev/ttyAir"

# Type and GPIO port of temperature/humidity sensor
TEMP_HUMID_TYPE = Adafruit_DHT.DHT22
TEMP_HUMID_GPIO = 4


# Set start time for token fetch interval
START_TIME = 0.0

# Set token renewal delay (in seconds)
RENEWAL_DELAY = 600.0

# Set token variable
TOKEN = "invalid_token"

def fetchToken(tries):
  if tries > 0:
    auth_head = "Basic " + base64.b64encode((CLIENT_ID + ":" + CLIENT_SECRET).encode()).decode('UTF-8')
    token_headers = {'content-type': 'application/x-www-form-urlencoded', 'authorization': auth_head}
    token_url = AUTH_HOST + "/oauth2/token"
    token_payload = {'grant_type': 'password', 'username': USERNAME, 'password': PASSWORD}
    try:
      r = requests.post(token_url, data=token_payload, headers=token_headers, timeout=1)
      if r.status_code == 200:
        return r.json()['access_token']
      else:
        return fetchToken(tries - 1)
    except requests.exceptions.RequestException:
      return fetchToken(tries - 1)
  else:
    return "invalid_token"

def sendValues(tries):
  if tries > 0:
    headers = {'content-type': 'text/plain', 'X-Auth-Token' : TOKEN, 'Fiware-Service': FIWARE_SERVICE, 'Fiware-ServicePath': FIWARE_SERVICE_PATH}
    # Original path:
    #url = HOST + "/iot/d?k=" + API_KEY + "&i=" + DEVICE_ID
    # New path:
    url = HOST + "/iot/d/" + API_KEY + "/" + DEVICE_ID
    payload = ("pm25|%s|pm10|%s|t|%s|h|%s" % (str(pm2_5), str(pm10), str(temp), str(humid)))
    try:
      r = requests.post(url, data=payload, headers=headers, timeout=1)
      if r.status_code == 200:
        print "+++ Payload: " + payload + " +++"
        return True
      else:
        return sendValues(tries - 1)
    except requests.exceptions.RequestException:
      return sendValues(tries - 1)
  else:
    return False

while True:
    try:
      serAir = serial.Serial(SERIAL_PORT_AIR, baudrate = 9600, timeout = 5)
    except serial.SerialException:
      print "!!! At least one serial port busy/not reachable. Restarting... !!!"
      time.sleep(5)
      continue

    print "\n>>> Transmission of values <<<\n"
    while True:
      print "----------------------------------------"
      print "*** Press CTRL-C at any time to exit ***"
      print "\n[Reading temperature and humidity values...]"
      tempData = None
      humidData = None
      for cnt in xrange(0, 30):
        if humidData is None or tempData is None:
          humidData, tempData = Adafruit_DHT.read(TEMP_HUMID_TYPE, TEMP_HUMID_GPIO)
          time.sleep(0.1)
          success = False
        else:
          success = True
          break
      if not success:
        print "!!! Values could not be fetched. Skipping iteration... !!!"
        time.sleep(SENSOR_TIMEOUT)
        continue
      else:
        humid = "{0:.1f}".format(humidData)
        temp = "{0:.1f}".format(tempData)
        print "+++ Temperature: " + temp + " +++"
        print "+++ Humidity: " + humid + " +++"
        success = False

      print "\n[Reading PM2.5 and PM10 values...]"
      airData = "none"
      for cnt in xrange(0, 10):
        if (len(airData) < 10) or (ord(airData[0]) != 170) or (ord(airData[1]) != 192):
          time.sleep(0.1)
          airData = serAir.read(10)
          serAir.flushInput()
          success = False
        else:
          success = True
          break
      if not success:
        print "!!! Values could not be parsed. Skipping iteration... !!!"
        time.sleep(SENSOR_TIMEOUT)
        continue
      else:
        pm2_5 = float(ord(airData[3]) * 256 + ord(airData[2]))/10
        pm10 = float(ord(airData[5]) * 256 + ord(airData[4]))/10
        print "+++ PM2.5: " + str(pm2_5) + " +++"
        print "+++ PM10: " + str(pm10) + " +++"
        success = False

      # Only renew token after interval expires (if authentication is enabled)
      END_TIME = time.time()

      if AUTH_ENABLED and END_TIME - START_TIME >= RENEWAL_DELAY:
        print "\n[Fetching valid OAuth2 token...]"
        TOKEN = fetchToken(3)
        if TOKEN != "invalid_token":
          START_TIME = time.time()
          print "+++ Token successfully received! +++"
          print "Token: " + TOKEN
        else:
          print "!!! Fetching token failed. Skipping iteration... !!!"
          time.sleep(SENSOR_TIMEOUT)
          continue

      print "\n[Sending values to server...]"
      if sendValues(3):
        print "+++ Payload successfully sent! +++"
      else:
        print "!!! Sending values failed. Skipping iteration... !!!"

      # Subtract the delay for reading temperature/humidity values
      if SENSOR_TIMEOUT > 2:
        time.sleep(SENSOR_TIMEOUT - 2)
      else:
        time.sleep(SENSOR_TIMEOUT)