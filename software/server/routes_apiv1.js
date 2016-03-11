// API - versie 1
var express = require('express');
var router = express.Router();
var jwt = require('jwt-simple');
//var sqlite3 = require('sqlite3').verbose();
var path = require('path');

// Fall back, display some info
router.get('*', function (req, res) {
    res.status(200);
    res.json({
        "description": "Project X API version 1. Please use API version 2"
    });
});


module.exports = router;