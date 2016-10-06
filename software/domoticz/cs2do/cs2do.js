var http = require('http');
var request = require('request');
var config = require('./config.json');

// Emppt token,
var emonRequestToken = "";

//
//
//
function getCSgrip() {

    var CSGripDataRequestOptions = {
        url: config.url + ":" + config.port + "/" + config.api + "/ipu",
        method: 'GET',
        headers: {
            'Contect-Type' : 'application/json',
            'X-Access-Token' : emonRequestToken
        },
        json : true
    };

    var CSGripTokenRequestOptions = {
        url: config.url + ":" + config.port + "/" + config.api + "/login",
        method: 'POST',
        headers: {
            'Contect-Type' : 'application/json'
        },
        json: {
            username : config.username,
            password : config.password
        }
    };

    //
    //
    //
    var dataRequest = request( CSGripDataRequestOptions, function (error, response, body) {
        if(!error) {
            //
            // Update domoticz, translate emon meterid to domotics panel id using condig.json
            //
            if( response.statusCode == 200 ) {
                body.forEach( function(json) {
                    config.domoticz.forEach( function(id) {
                        if( id.eid === json.meterid) {

                            setDomoticz(id.did, json)

                            //console.log(id.eid + ":" + id.did );
                        }
                    });
                });
            } else {
                var tokenRequest = request(CSGripTokenRequestOptions, function(error, response, body){
                    if(!error) {
                        if (response.statusCode == 200) {
                            emonRequestToken = body.token;
                        } else {
                            console.log("??")
                        }
                    } else {
                        console.log(error.message);
                    }
                });
            }
        } else {
            console.log(error.message);
        }
    });
}


var periodic = setInterval( getEmon, 5000 );


//
//
//
function setDomoticz(did, json, cb)
{
    //var params = '/json.htm?type=command&param=udevice&idx=' + did + '&nvalue=&svalue=' + json.ipu + ';2009';
    var params = '/json.htm?type=command&param=udevice&idx=' + did + '&nvalue=0&svalue=' + json.ipu + ';0';

    var domoticzRequestOptions = {
        url: config.url + ":" + '8080' + params,
        method: 'PUT'
    };

    console.log(params);

    var domoticsRequest = request(domoticzRequestOptions, function(error, response, body){
        if(!error) {
            //console.log(response.statusCode + ':' +  body);
        } else {
            console.log(error.message);
        }
    });
}
