#!/usr/bin/python

import RPi.GPIO as GPIO
import signal
import time
import sqlite3 as lite
import logging
import sys
import os.path
import sys, getopt

# Setup logger, using http://victorlin.me/posts/2012/08/26/good-logging-practice-in-python
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

cwd = os.path.dirname(__file__)
logfile = os.path.realpath("{0}/emonlogger.log".format(cwd))
handler = logging.FileHandler(logfile)
handler.setLevel(logging.INFO)

formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)

logger.addHandler(handler)

# Global var's
start = time.time()
done = True

mid = 0
iopin = 0

#
# callback, called when falling edge on PIN_KWHLED is detected
#
def cbKWHLed(channel):
	
	# Calculate instantaneous power usage (demand) in [W]
	global start
	now = time.time() 
	delta = now - start
	start = now
	ipu = (3600/delta);
	
	# update ipu in db
	try:
		cwd = os.path.dirname(__file__)
		dbfile = os.path.realpath("{0}/../database/emon.db".format(cwd))

		db = lite.connect(dbfile);
		cur = db.cursor();
		
		query = "UPDATE meter SET ipu=%s, updated=datetime('now') WHERE id=%s" % (int(round(ipu)), mid)
		cur.execute(query)	
		logger.debug(query) 

		query = "INSERT INTO measurement (epoch, m_id) VALUES (%s, %s)" % (int(now), mid)
		cur.execute(query)
		logger.debug(query) 

		db.commit()		

	except lite.Error, err:
		logger.error("%s" % err.args[0]);

	finally:
		if db:
			db.close();	


def ctrlc(sig, frame):
	global done 
	done = False


def main(argv):
	
	global done
	global iopin
	global mid
	
	try:
		opts, args = getopt.getopt(argv[1:],"hp:m:")
	except	getopt.GetoptError, err:
		logger.error(err)
		sys.exit(-1)
	
	for opt, arg in opts:
		if opt == "-h":
			print "Usage: {0} -h | -p<I/O port> -m<meter id> -d<sqlite3 database file>".format(argv[0])
			sys.exit()
		if opt == "-p":
			iopin = int(arg)
		if opt == "-m":
			mid = int(arg)

	logger.debug("IO pin : {0}".format(iopin))
	logger.debug("mid    : {0}".format(mid))
	
	# Broadcom mode, pin is input. No pullup/down
	# needed
	GPIO.setmode(GPIO.BCM)
	GPIO.setup(iopin, GPIO.IN)
	
	#
	# Set falling edge callback
	#
	GPIO.add_event_detect(iopin, GPIO.FALLING, callback=cbKWHLed, bouncetime = 10)
	
	#
	# SIGINT
	#
	signal.signal(signal.SIGINT, ctrlc)

	# 
	# 'main'
	#
	logger.debug('Starting monitoring')

	done = True;
	while done != False:
		time.sleep(1)	
	
	GPIO.remove_event_detect(iopin);
	GPIO.cleanup();

	logger.debug('Cleanup, bye')

if __name__ == "__main__":
	main(sys.argv)
