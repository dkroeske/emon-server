#!/usr/bin/python

# import MySQLdb
import sqlite3 as lite
import logging
import sys, getopt

#
# DB_HOST = "localhost"
# DB_NAME	= "energy"
# DB_PASSWD = "energy2014"
# DB_SCHEME = "emon"

# Setup logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

con = None

# Defaults
dbfile   = 'emon.db'
interval = 3600
identifier = 0

# check input
def main(argv):
	
	global dbfile
	global interval

	try:
		opts, args = getopt.getopt(argv,"hi:d:")
	except getopt.GetoptError, err:
		logger.info(err)
		sys.exit(-1)
	for opt, arg in opts:
		if opt == "-h":	
			print "Usage: xxxx.py -h | -i<interval in seconds> -d<sqlite3 database file>"
			sys.exit()
		if opt == "-i":
			interval = arg
		if opt == "-m":
			identifier = arg
		if opt == "-d":
			dbfile = arg
	
	if (len(opts) != 2) :
		print "Usage: xxxx.py -h | -i<interval in seconds> -d<sqlite3 database file>"
		sys.exit(2);
	else:
		# Log all settings
		logger.info("dbfile  : {0}".format(dbfile))
		logger.info("interval: {0}".format(interval))

		# Perform query
		handleTransaction(dbfile = dbfile, interval = interval)

		sys.exit();

#
# Connect to db and
# 1) Perform query
# 2) Store results in (new) table
#
def handleTransaction(dbfile, interval):
	# db = database
	# cur = db.cursor()

	try:
		connection = lite.connect(dbfile)
		cursor = connection.cursor();

		query = "SELECT id FROM METER"
		cursor.execute(query)
		data = cursor.fetchall()
		for m_id in data :

			# Create table name
			tableName = "emon_" + str(m_id[0]) + "_" + interval;

			query = """DROP TABLE IF EXISTS %s""" % (tableName)
			#logger.info(query)
			cursor.execute(query)

			query = """CREATE TABLE IF NOT EXISTS %s (
				id INTEGER PRIMARY KEY, 
				epoch INTEGER NOT NULL, 
				ticks INTEGER NOT NULL,
				m_id INTEGER NOT NULL,
				FOREIGN KEY (`m_id`) REFERENCES meter(`id`)
				ON DELETE CASCADE
				);""" % (tableName)
			#logger.info(query)
			cursor.execute(query)

			# Query hours and fill
			query = """SELECT epoch, count(epoch) FROM measurement WHERE m_id = %s
				GROUP BY (epoch / %s)
				ORDER BY epoch;""" % (m_id[0], interval)
			#logger.info(query)

			cursor.execute(query)
			data = cursor.fetchall() ;

			for row in data :
				query = ("""INSERT INTO %s (epoch, ticks, m_id) VALUES (%s, %s, %s)""" % 
					(tableName, int(row[0]), int(row[1]), int(m_id[0])))
				#logger.info(query)
				cursor.execute(query)
			
			connection.commit()

	except lite.Error, e:
		logger.error("Error %s:" % e.args[0])
		if connection:
			connection.rollback()

	finally:
		if connection:
			connection.close()

	# db.close();


if __name__ == "__main__":
	main(sys.argv[1:])
