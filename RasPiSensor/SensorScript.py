import serial, time, sys


SER_PORT_GSMGPS = "/dev/ttyGSMGPS"
SER_PORT_AIR = "/dev/ttyAir"

SENSOR_TIMEOUT = 5

MOB_CARRIER = "A1"
APN = "webapn.at"

FIWARE_HEADERS = "Fiware-Service: graziot\\r\\nFiware-ServicePath: /"
URL = "http://160.85.2.61:7896/iot/d?k=apimobile&i=Dev_RasPi"


try:
  serGSMGPS = serial.Serial(SER_PORT_GSMGPS, baudrate = 115200, timeout = 5)
  serAir = serial.Serial(SER_PORT_AIR, baudrate = 9600, timeout = 5)
except serial.SerialException:
  sys.exit("At least one serial port busy/not reachable. Exiting...")

reply = ""
exit = False

print ">>> Hardware preparation <<<"
print "Checking modem status..."
for cnt in range(0, 100):
  if MOB_CARRIER not in reply:
    serGSMGPS.write("AT+COPS?\r")
    time.sleep(0.1)
    reply = serGSMGPS.read(serGSMGPS.inWaiting())
    exit = True
  else:
    print "+++ Modem online! +++"
    reply = ""
    exit = False
    break

if exit:
  serGSMGPS.write("AT+CFUN=1,1\r")
  sys.exit("!!! Modem not responding. Exiting... !!!")

print "\nPowering up GPS module..."
for cnt in range(0, 10):
  if "OK" not in reply:
    serGSMGPS.write("AT+CGNSPWR=1\r")
    time.sleep(0.1)
    reply = serGSMGPS.read(serGSMGPS.inWaiting())
    exit = True
  else:
    print "+++ GPS module active! +++"
    reply = ""
    exit = False
    break

if exit:
  serGSMGPS.write("AT+CFUN=1,1\r")
  sys.exit("!!! GPS module not responding. Exiting... !!!")

print "\n>>> GPRS connection setup <<<"
print "Setting APN data..."
for cnt in range(0, 10):
  if "OK" not in reply:
    serGSMGPS.write("AT+SAPBR=3,1,\"APN\",\"" + APN + "\"\r")
    time.sleep(0.1)
    reply = serGSMGPS.read(serGSMGPS.inWaiting())
    exit = True
  else:
    print "+++ APN successfully set! +++"
    reply = ""
    exit = False
    break

if exit:
  serGSMGPS.write("AT+CFUN=1,1\r")
  sys.exit("!!! APN could not be set. Exiting... !!!")

print "\nInitialising GPRS connection..."
for cnt in range(0, 50):
  if "OK" not in reply:
    serGSMGPS.write("AT+SAPBR=1,1\r")
    time.sleep(0.1)
    reply = serGSMGPS.read(serGSMGPS.inWaiting())
    exit = True
  else:
    print "+++ GPRS connection active! +++"
    reply = ""
    exit = False
    break

if exit:
  serGSMGPS.write("AT+CFUN=1,1\r")
  sys.exit("!!! GPRS connection failed. Exiting... !!!")

print "\n>>> GPS preparation <<<"
print "Waiting for 3D location fix..."
for cnt in range(0, 600):
  if "Location 3D Fix" not in reply:
    serGSMGPS.write("AT+CGPSSTATUS?\r")
    time.sleep(0.1)
    reply = serGSMGPS.read(serGSMGPS.inWaiting())
    exit = True
  else:
    print "+++ 3D fix acquired! +++"
    reply = ""
    exit = False
    break

if exit:
  serGSMGPS.write("AT+CFUN=1,1\r")
  sys.exit("!!! Insufficient satellite reception. Exiting... !!!")

print "\n>>> Transmission of values <<<"
try:
  while True:
    print "\n-----------------------------------------"
    print "*** Press CTRL-C at any time to exit ***"
    print "\nFetching current location..."
    reply = ""
    skip = False
    for cnt in range(0, 10):
      if "Location 3D Fix" not in reply:
        serGSMGPS.write("AT+CGPSSTATUS?\r")
        time.sleep(0.1)
        reply = serGSMGPS.read(serGSMGPS.inWaiting())
        skip = True
      else:
        serGSMGPS.write("AT+CGNSINF\r")
        time.sleep(0.1)
        locData = serGSMGPS.read(serGSMGPS.inWaiting()).split(',')
        lat = locData[3]
        lon = locData[4]
        print "+++ Latitude: " + str(lat) + " +++"
        print "+++ Longitude: " + str(lon) + " +++"
        reply = ""
        skip = False
        break

    if not skip:
      print "\nReading PM2.5 and PM10 values..."
      airData="none"
      for cnt in range(0,10):
        if (ord(airData[0]) != 170) or (ord(airData[1]) != 192):
          airData = serAir.read(10)
          time.sleep(0.1)
        else:
          break
      pm2_5 = float(ord(airData[3]) * 256 + ord(airData[2]))/10
      pm10 = float(ord(airData[5]) * 256 + ord(airData[4]))/10
      print "+++ PM2.5: " + str(pm2_5) + " +++"
      print "+++ PM10: " + str(pm10) + " +++"

      print "\nSending values to server..."
      reply = ""
      payload = ("l|%s,%s|a1|%s|a2|%s|t|%s|h|%s" % (str(lat), str(lon), str(pm2_5), str(pm10), str(0), str(0)))
      print "+++ Payload: " + payload + " +++"
      serGSMGPS.write("AT+HTTPINIT\r")
      time.sleep(0.1)
      serGSMGPS.write("AT+HTTPPARA=\"CID\",1\r")
      time.sleep(0.1)
      serGSMGPS.write("AT+HTTPPARA=\"CONTENT\",\"text/plain\"\r")
      time.sleep(0.1)
      serGSMGPS.write("AT+HTTPPARA=\"USERDATA\",\"" + FIWARE_HEADERS + "\"\r")
      time.sleep(0.1)
      serGSMGPS.write("AT+HTTPPARA=\"URL\",\"" + URL + "\"\r")
      time.sleep(0.1)
      serGSMGPS.write("AT+HTTPDATA=" + str(len(payload)) + ",1000\r")
      time.sleep(0.1)
      serGSMGPS.write(payload)
      time.sleep(0.1)
      serGSMGPS.write("AT+HTTPACTION=1\r")
      time.sleep(0.1)
      reply = serGSMGPS.read(serGSMGPS.inWaiting())
      serGSMGPS.write("AT+HTTPTERM\r")
      if "OK" in reply:
        print "+++ Payload successfully sent! +++"
      else:
        print "!!! Sending values failed. Skipping iteration... !!!"
    else:
      print "!!! Insufficient satellite reception. Skipping iteration... !!!"

    time.sleep(SENSOR_TIMEOUT)
except KeyboardInterrupt:
  pass

# Reset module states
serGSMGPS.write("AT+CFUN=1,1\r")
sys.exit("Exiting...")
