#!/usr/bin/env python
# -*- coding: utf-8 -*-

import serial, requests, time, sys, signal, Adafruit_DHT


# Location of sensor
LAT = 47.086842
LON = 15.432220

# Paths to serial port devices
SERIAL_PORT_AIR = "/dev/ttyAir"

# Settings for temperature/humidity sensor
TEMP_HUMID_TYPE = Adafruit_DHT.DHT22
TEMP_HUMID_GPIO = 4

# Delay between transmissions of sensor measurements (in seconds)
SENSOR_TIMEOUT = 15

# Settings for communicating with the FIWARE IoT agent
HEADERS = {'content-type': 'text/plain', 'Fiware-Service': 'graziot', 'Fiware-ServicePath': '/' }
URL = "http://160.85.2.61:7896/iot/d?k=apitest&i=Dev_RasPi"


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

      print "\n[Sending values to server...]"
      payload = ("l|%s,%s|a1|%s|a2|%s|t|%s|h|%s" % (str(LAT), str(LON), str(pm2_5), str(pm10), str(temp), str(humid)))
      print "+++ Payload: " + payload + " +++"
      try:
        r = requests.post(URL, data=payload, headers=HEADERS, timeout=1)
        if r.status_code == 200:
          print "+++ Payload successfully sent! +++"
        else:
          print "!!! Sending values failed. Skipping iteration... !!!"
      except requests.exceptions.RequestException as e:
        print "!!! Exception raised while sending values. Skipping iteration... !!!"
        print "Exception: " + e.message

      # Subtract the delay for reading temperature/humidity values
      if SENSOR_TIMEOUT > 2:
        time.sleep(SENSOR_TIMEOUT - 2)
except KeyboardInterrupt:
  sys.exit("\rCTRL-C received. Exiting...")
except serial.SerialException:
  sys.exit("At least one serial port busy/not reachable. Exiting...")
