#!/usr/bin/python

import RPi.GPIO as GPIO
import signal
import time
import sqlite3 as lite
import logging
import sys
import os.path

# Setup logger, using http://victorlin.me/posts/2012/08/26/good-logging-practice-in-python
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

cwd = os.path.dirname(__file__)
logfile = os.path.realpath("{0}/emon.log".format(cwd))
handler = logging.FileHandler(logfile)
handler.setLevel(logging.DEBUG)

formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)

logger.addHandler(handler)

# Blinking led is connected to GPIO4 (#7)
PIN_KWHLED = 4

# Broadcom mode, pin is input. No pullup/down
# needed
GPIO.setmode(GPIO.BCM)
GPIO.setup(PIN_KWHLED, GPIO.IN)

# Global var's
start = time.time()

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
		
		query = """UPDATE meter SET ipu=(?) WHERE id=(?)"""
		cur.execute(query,(int(round(ipu)),int(21)))	

		query = """INSERT INTO measurement (epoch, m_id) VALUES (?, ?)"""
		cur.execute(query,(int(now),int(21)))

		db.commit()		

		logger.info('Pulse detected, inserted epoch (%d) in db. ipu = %d W' % (now, int(round(ipu))) )

	except lite.Error, err:
		print 'error'
		logger.error("%s" % err.args[0]);

	finally:
		if db:
			db.close();	

#
#
#
def ctrlc(sig, frame):
	global done 
	done = False

#
# Set falling edge callback
#
GPIO.add_event_detect(PIN_KWHLED, GPIO.FALLING, callback=cbKWHLed, bouncetime = 10)

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
GPIO.remove_event_detect(PIN_KWHLED);
GPIO.cleanup();

logger.debug('Cleanup, bye')
