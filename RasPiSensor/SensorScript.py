import serial, time, sys, signal


SERIAL_PORT_GSMGPS = "/dev/ttyGSMGPS"
SERIAL_PORT_AIR = "/dev/ttyAir"

SENSOR_TIMEOUT = 5

MOBILE_CARRIER = "A1"
APN = "webapn.at"

FIWARE_HEADERS = "Fiware-Service: graziot\\r\\nFiware-ServicePath: /"
URL = "http://160.85.2.61:7896/iot/d?k=apimobile&i=Dev_RasPi"


serGSMGPS = None

def sendCommand(command, reply, count, timeout):
  resp = ""
  complete = False

  for cnt in xrange(0, count):
    if reply not in resp:
      serGSMGPS.write(command)
      time.sleep(timeout)
      resp = serGSMGPS.read(serGSMGPS.inWaiting())
      complete = False
    else:
      complete = True
      break

  return complete

def sigTermExit(signal, frame):
  try:
    serGSMGPS.write("AT+CFUN=1,1\r")
  except AttributeError:
    pass
  sys.exit("\rSIGTERM received. Exiting...")

# Catch SIGTERM signal for controlled termination
signal.signal(signal.SIGTERM, sigTermExit)

while True:
  try:
    serGSMGPS = serial.Serial(SERIAL_PORT_GSMGPS, baudrate = 115200, timeout = 5)
    serAir = serial.Serial(SERIAL_PORT_AIR, baudrate = 9600, timeout = 5)
  except serial.SerialException:
    print "!!! At least one serial port busy/not reachable. Restarting... !!!"
    time.sleep(5)
    continue

  print ">>> Hardware preparation <<<"
  print "\n[Resetting modem...]"
  success = sendCommand("AT+CFUN=1,1\r", "OK", 3000, 0.01)
  if not success:
    print "!!! Modem not responding. Restarting... !!!"
    time.sleep(5)
    continue
  else:
    print "+++ Modem successfully reset! +++"
    success = False

  print "\n[Checking modem status...]"
  success = sendCommand("AT+COPS?\r", MOBILE_CARRIER, 3000, 0.01)
  if not success:
    print "!!! Modem not responding. Restarting... !!!"
    time.sleep(5)
    continue
  else:
    print "+++ Modem online! +++"
    success = False

  print "\n[Powering up GPS module...]"
  success = sendCommand("AT+CGNSPWR=1\r", "OK", 100, 0.01)
  if not success:
    print "!!! GPS module not responding. Restarting... !!!"
    time.sleep(5)
    continue
  else:
    print "+++ GPS module active! +++"
    success = False

  print "\n>>> GPRS connection setup <<<"
  print "\n[Setting APN data...]"
  success = sendCommand("AT+SAPBR=3,1,\"APN\",\"" + APN + "\"\r", "OK", 100, 0.01)
  if not success:
    print "!!! APN could not be set. Restarting... !!!"
    time.sleep(5)
    continue
  else:
    print "+++ APN successfully set! +++"
    success = False

  print "\n[Initialising GPRS connection...]"
  success = sendCommand("AT+SAPBR=1,1\r", "OK", 3000, 0.01)
  if not success:
    print "!!! GPRS connection failed. Restarting... !!!"
    time.sleep(5)
    continue
  else:
    print "+++ GPRS connection active! +++"
    success = False

  print "\n>>> GPS preparation <<<"
  print "\n[Waiting for 3D location fix...]"
  success = sendCommand("AT+CGPSSTATUS?\r", "Location 3D Fix", 12000, 0.01)
  if not success:
    print "!!! Insufficient satellite reception. Restarting... !!!"
    time.sleep(5)
    continue
  else:
    print "+++ 3D fix acquired! +++"
    success = False

  print "\n>>> Transmission of values <<<\n"
  try:
    while True:
      print "----------------------------------------"
      print "*** Press CTRL-C at any time to exit ***"
      print "\n[Fetching current location...]"
      success = sendCommand("AT+CGPSSTATUS?\r", "Location 3D Fix", 100, 0.01)
      if not success:
        print "!!! Insufficient satellite reception. Skipping iteration... !!!"
        time.sleep(5)
        continue
      else:
        serGSMGPS.write("AT+CGNSINF\r")
        time.sleep(0.1)
        locData = serGSMGPS.read(serGSMGPS.inWaiting()).split(',')
        lat = locData[3]
        lon = locData[4]
        print "+++ Latitude: " + str(lat) + " +++"
        print "+++ Longitude: " + str(lon) + " +++"
        success = False

      print "\n[Reading PM2.5 and PM10 values...]"
      airData="none"
      for cnt in xrange(0, 10):
        if (ord(airData[0]) != 170) or (ord(airData[1]) != 192):
          airData = serAir.read(10)
          time.sleep(0.1)
          success = False
        else:
          success = True
          break
      if not success:
        print "!!! Values could not be parsed. Skipping iteration... !!!"
        time.sleep(5)
        continue
      else:
        pm2_5 = float(ord(airData[3]) * 256 + ord(airData[2]))/10
        pm10 = float(ord(airData[5]) * 256 + ord(airData[4]))/10
        print "+++ PM2.5: " + str(pm2_5) + " +++"
        print "+++ PM10: " + str(pm10) + " +++"
        success = False

      print "\n[Sending values to server...]"
      reply = ""
      payload = ("l|%s,%s|a1|%s|a2|%s|t|%s|h|%s" % (str(lat), str(lon), str(pm2_5), str(pm10), str(0), str(0)))
      print "+++ Payload: " + payload + " +++"
      serGSMGPS.write("AT+HTTPINIT\r")
      time.sleep(0.01)
      serGSMGPS.write("AT+HTTPPARA=\"CID\",1\r")
      time.sleep(0.01)
      serGSMGPS.write("AT+HTTPPARA=\"CONTENT\",\"text/plain\"\r")
      time.sleep(0.01)
      serGSMGPS.write("AT+HTTPPARA=\"USERDATA\",\"" + FIWARE_HEADERS + "\"\r")
      time.sleep(0.01)
      serGSMGPS.write("AT+HTTPPARA=\"URL\",\"" + URL + "\"\r")
      time.sleep(0.01)
      serGSMGPS.write("AT+HTTPDATA=" + str(len(payload)) + ",1000\r")
      time.sleep(0.01)
      serGSMGPS.write(payload)
      time.sleep(0.01)
      serGSMGPS.write("AT+HTTPACTION=1\r")
      time.sleep(0.01)
      reply = serGSMGPS.read(serGSMGPS.inWaiting())
      serGSMGPS.write("AT+HTTPTERM\r")
      if "OK" in reply:
        print "+++ Payload successfully sent! +++"
      else:
        print "!!! Sending values failed. Skipping iteration... !!!"

      time.sleep(SENSOR_TIMEOUT)
  except KeyboardInterrupt:
    serGSMGPS.write("AT+CFUN=1,1\r")
    sys.exit("\rCTRL-C received. Exiting...")
