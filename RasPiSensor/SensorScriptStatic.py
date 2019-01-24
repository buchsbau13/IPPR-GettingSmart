#!/usr/bin/env python
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


# Set loop counter
LOOP_COUNT = 0

# Set token variable
TOKEN = "invalid_token"

def sigTermExit(signal, frame):
  sys.exit("\rSIGTERM received. Exiting...")

# Catch SIGTERM signal for controlled termination
signal.signal(signal.SIGTERM, sigTermExit)

try:
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

      # Only get token every 50 transmissions (if authentication is enabled)
      if AUTH_ENABLED and LOOP_COUNT % 50 == 0:
        print "\n[Fetching valid OAuth2 token...]"
        auth_head = "Basic " + base64.b64encode((CLIENT_ID + ":" + CLIENT_SECRET).encode()).decode('UTF-8')
        token_headers = {'content-type': 'application/x-www-form-urlencoded', 'authorization': auth_head}
        token_url = AUTH_HOST + "/oauth2/token"
        token_payload = {'grant_type': 'password', 'username': USERNAME, 'password': PASSWORD}
        try:
          r = requests.post(token_url, data=token_payload, headers=token_headers, timeout=2)
          if r.status_code == 200:
            print "+++ Token successfully received! +++"
            TOKEN = r.json()['access_token']
            print "Token: " + TOKEN
          else:
            print "!!! Fetching token failed. Skipping iteration... !!!"
            time.sleep(SENSOR_TIMEOUT)
            continue
        except requests.exceptions.RequestException:
          print "!!! Exception raised while fetching token. Skipping iteration... !!!"
          print "Exception: " + str(e)
          time.sleep(SENSOR_TIMEOUT)
          continue

      print "\n[Sending values to server...]"
      headers = {'content-type': 'text/plain', 'X-Auth-Token' : TOKEN, 'Fiware-Service': FIWARE_SERVICE, 'Fiware-ServicePath': FIWARE_SERVICE_PATH}
      url = HOST + "/iot/d?k=" + API_KEY + "&i=" + DEVICE_ID
      payload = ("pm25|%s|pm10|%s|t|%s|h|%s" % (str(pm2_5), str(pm10), str(temp), str(humid)))
      print "+++ Payload: " + payload + " +++"
      try:
        r = requests.post(url, data=payload, headers=headers, timeout=2)
        if r.status_code == 200:
          print "+++ Payload successfully sent! +++"
        else:
          print "!!! Sending values failed. Skipping iteration... !!!"
      except requests.exceptions.RequestException:
        print "!!! Exception raised while sending values. Skipping iteration... !!!"
        print "Exception: " + str(e)

      # Increase loop counter
      LOOP_COUNT += 1
      if LOOP_COUNT > 50:
        LOOP_COUNT = 1

      # Subtract the delay for reading temperature/humidity values
      if SENSOR_TIMEOUT > 2:
        time.sleep(SENSOR_TIMEOUT - 2)
except KeyboardInterrupt:
  sys.exit("\rCTRL-C received. Exiting...")
except serial.SerialException:
  sys.exit("At least one serial port busy/not reachable. Exiting...")
