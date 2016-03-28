// emon api version 2 - (E-Monitoring API)
var express = require('express');
var router = express.Router();
var jwt = require('jwt-simple');
var sqlite3 = require('sqlite3').verbose();
var path = require('path');

//
// Alle endpoint behalve /apiv2/login require X-Access-Token
//
// Ook kan (weg laten van newRegExp): 
//      router.all(/[^(\/login)]/, function (req, res, next) 
// Let op ! zonder ' (quotes)
//
router.all( new RegExp("[^(\/login)]"), function (req, res, next) {

    // Zonder reguliere expressie een if gebruiken om router eruit
    // te filteren:
    // if( req.url.indexOf('/login') > -1) {
    //     return next();
    // }

    // For all the others
    var token = (req.header('X-Access-Token')) || '';
    if (token) {
        try {
            var decoded = jwt.decode(token, req.app.get('secretkey'));

            // Check if token is from known user
            // to do: db lookup
            var userName = req.app.get('username')

            if (decoded.iss == userName) {
                req.app.set("userid", decoded.iss);
                console.log("Userid: " + req.app.get('userid'));
                return next();
            }
            else {
                res.status(401);
                res.json({
                    "status": 401, "message": "unknown userid, bye"
                });
            }
        }
        catch (err) {
            console.log("Authorization failed: " + err);
        }
    }

    res.status(401);
    res.json({
        "status": 401, "message": "unknown userid, bye"
    });
});


// Restfull login
router.post('/login', function (req, res) {

    var username = req.body.username || '';
    var password = req.body.password || '';

    // do db lookup
    var loginName = req.app.get('username');
    var loginPass = req.app.get('password');

    // Check for empy body
    if (username == '' || password == '') {
        res.status(401);
        res.json({
            "status": 401,
            "message": "Unknown USER, bye"
        });
        return;
    }

    // Check for valid user/passwd combo
    if ((username == loginName) && (password == loginPass)) {
        var now = new Date();
        var expires = now.setHours(now.getDay() + 10);
        var token = jwt.encode({
            iss: username,
            exp: expires
        }, req.app.get('secretkey'));

        res.status(200);
        res.json({
            token: token,
            expires: expires,
            user: username
        });
    }
    else {
        res.status(401);
        res.json({
            "status": 401,
            "message": "Unknown USER, bye"
        });
    }
});


// Instantaneous Power Usage
router.get('/ipu', function (req, res) {
    var query = 'SELECT * FROM meter;';
    var dbfile = req.app.get('dbfile');
    var db = new sqlite3.Database(dbfile);
    
    db.all(query, function (err, rows) {
        if(err) {
            res.status(500);
            res.json("Something bad happened");
            return;
        }
    
        console.log(JSON.stringify(rows));

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
        res.status(200);
        res.json(results);
    });

    db.close();
});

//
router.get('/24h', function (req, res) {
    res.json("SELECT (epoch) as time, ticks FROM emon_3600 where FROM_UNIXTIME(epoch, \'%Y-%m-%d\') = curdate();'")
});
        // get24h: function(req, res) {
        //         var query = 'SELECT (epoch) as time, ticks FROM emon_3600 where ' +
        //                                 'FROM_UNIXTIME(epoch, \'%Y-%m-%d\') = curdate();';
        //         handleRequest(req, res, query);
        // },


        // getNhour: function(req, res) {
        //         var interval = req.params.id;
        //         var query = 'SELECT (epoch) as time, ticks FROM emon_3600 where ' +
        //                                 'FROM_UNIXTIME(epoch, \'%Y-%m-%d\') > DATE_SUB(CURDATE(), INTERVAL ' + interval + ' HOUR);';
        //         handleRequest(req, res, query);
        // },


        // get7d: function(req, res) {
        //         var query = 'SELECT (epoch) as time, ticks FROM emon_86400 where ' +
        //                                 'FROM_UNIXTIME(epoch, \'%Y-%m-%d\') > DATE_SUB(CURDATE(), INTERVAL 7 DAY);';
        //         handleRequest(req, res, query);

        // },


        // getNday: function(req, res) {
        //         var interval = req.params.id;
        //         var query = 'SELECT (epoch) as time, ticks FROM emon_86400 where ' +
        //                                 'FROM_UNIXTIME(epoch, \'%Y-%m-%d\') > DATE_SUB(CURDATE(), INTERVAL ' + interval + ' DAY);';
        //         handleRequest(req, res, query);
        // },


// Fall back, display some info
router.get('/', function (req, res) {
    res.status(200);
    res.json({
        "description": "Project EMON API version 2. Welcome"
    });
});



module.exports = router;