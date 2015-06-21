var sqlite3 = require('sqlite3').verbose();
var path = require('path');

var info = {

	get24h: function(req, res) {
		var query = 'SELECT (epoch) as time, ticks FROM emon_3600 where ' + 
					'FROM_UNIXTIME(epoch, \'%Y-%m-%d\') = curdate();';
		handleRequest(req, res, query);
	},


	getNhour: function(req, res) {
		var interval = req.params.id;
		var query = 'SELECT (epoch) as time, ticks FROM emon_3600 where ' + 
					'FROM_UNIXTIME(epoch, \'%Y-%m-%d\') > DATE_SUB(CURDATE(), INTERVAL ' + interval + ' HOUR);';
		handleRequest(req, res, query);
	},


	get7d: function(req, res) {
		var query = 'SELECT (epoch) as time, ticks FROM emon_86400 where ' + 
					'FROM_UNIXTIME(epoch, \'%Y-%m-%d\') > DATE_SUB(CURDATE(), INTERVAL 7 DAY);';
		handleRequest(req, res, query);

	},


	getNday: function(req, res) {
		var interval = req.params.id;
		var query = 'SELECT (epoch) as time, ticks FROM emon_86400 where ' + 
					'FROM_UNIXTIME(epoch, \'%Y-%m-%d\') > DATE_SUB(CURDATE(), INTERVAL ' + interval + ' DAY);';
		handleRequest(req, res, query);
	},


	getipu: function(req, res) {
		var interval = req.params.id;
		var query = 'SELECT * FROM meter;';
		var dbfile = req.app.get('dbfile');
		var db = new sqlite3.Database(dbfile);			
		db.all(query, function (err, rows) {
			if(err) throw err;
			
			console.log(JSON.stringify(rows));
			
			var PSolar, PMain, PHouse, isEProducer;
			rows.forEach(function(item) {
				if(item.id == 21) PMain = item.ipu
				
				if(item.id == 24) PSolar = item.ipu
				
				console.info("****" + PSolar)			
	
//				if(PSolar >= PMeter) {
//					PHouse = PSolar - PMeter
//					isEProducer = YES
//				} else {
//				
//					PHouse = Meter - PSolar
//					isEProducer = NO
//				}
			});


			var results = [];
			rows.forEach(function(item){
				results.push({
					meterid: item.id,
					created: item.created,
					updated: item.updated,
					description: item.description,
					location: item.location,
					ipu: item.ipu
				});
			});
			res.json(results);
		});
		
		db.close();
	},

	// dummy post
	createInfo: function(req, res) {
		var message = req.body;
		dummy.push(message);
		res.json(dummy);
	},
};

module.exports = info;

//
// Helper functions
//
function handleRequest(req, res, query)
{
	var db = req.app.get('dbConnection');
	db.query(query, function (err, rows, fields) {
		if(err) throw err;
		var results = [];
		rows.forEach(function(item){
			results.push({
				time : item.time,
				ticks: item.ticks,
				cost : ((item.ticks / 1000) * req.app.get('kwhCost'))
			});
		});
		res.json(results);
	});	
}

//
// Dummy
//
var dummy = [{
	message : 'Warning, NodeJS is cool',
	id		: 1
}, {
	message : 'Visual Basic is boring',
	id		: 2
}];

// module.exports = info;
