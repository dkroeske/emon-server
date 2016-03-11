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


// Example call
router.get('/ipu', function (req, res) {

    // db lookup
    //var query = "select created, updated,location, description, frequency, m_id " +
    //    "from csgrip,measurement order by measurement.id desc limit 1;"
    //var dbfile = req.app.get('dbfile');
    //var db = new sqlite3.Database(dbfile);
    //db.all(query, function (err, rows) {
    //    if(err) throw err;
    //        var results = [];
    //        rows.forEach(function(item){
    //            results.push({
    //                created: item.created,
    //                updated: item.updated,
    //                description: item.description,
    //                location: item.location,
    //                frequency: item.frequency,
    //                unit : "Hz"
    //            });
    //        });
    //        res.json(results);
    //    });
    // db.close();
    res.status(200);

    var results = [];
    results.push({
        created: "2016FEB12-120001pm",
        updated: "2016FEB12-120001pm",
        description: "Dit is een beschrijvings",
        location: "Breda, the Netherlands",
        frequency: 50.0,
        unit : "Hz"
        },
        {
            created: "2016FEB12-120001pm",
            updated: "2016FEB12-120001pm",
            description: "Dit is een andere beschrijvings",
            location: "Eindhoven, the Netherlands",
            frequency: 51.9,
            unit : "Hz"
        });
    res.json(results);
});


// Fall back, display some info
router.get('/', function (req, res) {
    res.status(200);
    res.json({
        "description": "Project X API version 2. Welcome"
    });
});


module.exports = router;