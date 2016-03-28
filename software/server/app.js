var express 		= require('express');
var path			= require('path');
var bodyParser 		= require('body-parser');
var fs 				= require('fs');
var moment			= require('moment');
var routes_apiv1 	= require('./routes_apiv1');
var routes_apiv2 	= require('./routes_apiv2');
var app 			= express();

// 
// Override default log to terminal and/or to file
//
var log_file = fs.createWriteStream(__dirname + '/logs/app.log', {flags : 'a'});
var log_stdout = process.stdout;
var now = moment(new Date()).format('MMMM Do YYYY, h:mm:ss a');
console.log = function(msg){
	log_file.write(require('util').format( '[' + now +'] ' + msg) + '\n');
	// Uncomment if you want screen output
	//log_stdout.write(require('util').format( '[' + now +'] ' + msg) + '\n');
};

// Read all app settings 
var settings = require('./config.json');
app.set('secretkey', settings.secretkey);
app.set('username', settings.username);
app.set('password', settings.password);
app.set('webPort', settings.webPort);
app.set('dbfile', path.join(__dirname, settings.database));

//Vangt alle exceptions af, proces moet wel opnieuw gestart worden.
	process.on('uncaughtException', function (err) {
	log_file.write(require('util').format( '[' + now +'] '+ err.stack) + '\n');
	// Uncomment als je ook naar scherm wilt loggen
	//log_stdout.write(require('util').format( '[' + now +'] '+ err.stack) + '\n');
});

// 
app.use(bodyParser.urlencoded({ extended:true }));
app.use(bodyParser.json());

// Middelware, voor alle /api/* request
app.all('*', function(req, res, next) 
{
	// Log alle request
	console.log( req.method + " " + req.url) ;
	next();
});

// Middelware, voor alle /api/* request
app.all('/api/*', function(req, res, next) 
{
	// Set respons header (geen idee of dit compleet is)
	res.header("Access-Control-Allow-Origin","*");
	res.header("Access-Control-Allow-Methods","GET,PUT,POST,DELETE,OPTIONS");
	res.header("Access-Control-Allow-Headers","X-Requested-With,Content-type,Accept,X-Access-Token,X-Key");

	// Set response contenttype
	res.contentType('application/json');

	next();
});

// Middleware statische bestanden (HTML, CSS, images)
app.use(express.static(__dirname + '/public'));

// Routing with versions
app.use('/apiv1', routes_apiv1);
app.use('/apiv2', routes_apiv2);


// Start server
var port = process.env.PORT || app.get('webPort');
var server = app.listen( port , function() {
	console.log('Listening server on port ' + server.address().port );
});
