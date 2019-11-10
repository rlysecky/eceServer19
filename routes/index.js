var express = require('express');
var router = express.Router();
var path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.redirect('index.html');
	//res.sendFile(path.resolve('public/holz/index.html'));
	//res.render('index');
});


module.exports = router;
