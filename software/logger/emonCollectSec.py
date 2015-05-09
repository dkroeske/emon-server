#!/usr/bin/python

import MySQLdb
import logging
import sys, getopt

#
DB_HOST = "localhost"
DB_NAME	= "energy"
DB_PASSWD = "energy2014"
DB_SCHEME = "emon"

# Setup logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# check input
def main(argv):

	try:
		opts, args = getopt.getopt(argv,"hi:")
	except getopt.GetoptError, err:
		logger.info(err)
		sys.exit(-1)
	for opt, arg in opts:
		if opt == "-h":	
			print "Usage: xxxx.py -h | -i<interval in seconds>"
			sys.exit()
		if opt == "-i":
			db = setupDB()
			handleTransaction(database = db, interval = arg)	
			
	sys.exit();


#
# Setup db
#
def setupDB():
	db = MySQLdb.connect(host=DB_HOST, user=DB_NAME, passwd=DB_PASSWD, db=DB_SCHEME);
	logger.info('Succesfully connected to db')
	return db;

#
# Connect to db and
# 1) Perform query
# 2) Store results in (new) table
#
def handleTransaction(database, interval):
	db = database
	cur = db.cursor()

	try:
		# Create table name
		tableName = "emon_"+interval;

		query = """DROP TABLE IF EXISTS %s""" % (tableName)
		cur.execute(query)

		query = """CREATE TABLE IF NOT EXISTS %s (
			m_id BIGINT(20) NOT NULL PRIMARY KEY AUTO_INCREMENT, 
			epoch INT(11) NOT NULL, 
			ticks INT NOT NULL,
			k_id BIGINT(20) NOT NULL,
			FOREIGN KEY fk_kwhmeter(k_id) 
			REFERENCES kwhmeter(k_id)
			ON DELETE CASCADE
			);""" % (tableName)
		cur.execute(query)

		# Query hours and fill
		query = """SELECT epoch, count(epoch) FROM measurement 
			GROUP BY epoch DIV %s
			ORDER BY epoch;""" % (interval)
		cur.execute(query)
		data = cur.fetchall() ;

		for row in data:
			query = ("""INSERT INTO %s (epoch, ticks, k_id) VALUES (%s, %s, %s)""" % 
				(tableName, int(row[0]), int(row[1]), int(2)))
			cur.execute(query)
		db.commit()

	except:
		logger.error("""create error""")

	db.close();


if __name__ == "__main__":
	main(sys.argv[1:])
