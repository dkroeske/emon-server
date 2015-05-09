var express = require('express');
var router = express.Router();

//var auth = require('./auth.js');
var info = require('./info.js');
// var users = require('./users.js');

/*
 * routes without auth, login generate API key
 */
//router.post('/api/login', auth.login);

/*
 * Auth verplicht, dummy GET/POSTS
 */
router.get('/api/24h', info.get24h);
router.get('/api/7d', info.get7d);
router.get('/api/nday/:id', info.getNday);
router.get('/api/nhour/:id', info.getNhour);
router.get('/api/ipu', info.getipu);

router.post('/api/info/', info.createInfo);


//
module.exports = router;

