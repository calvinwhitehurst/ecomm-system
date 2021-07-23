var express = require("express");
var isLoggedIn = require("./custom_modules/isLoggedIn.js");
var connection = require("./custom_modules/connection.js");
var queries = require("./custom_modules/queries.js");
var router = express.Router();
	
router.get('/createlabels', isLoggedIn, function(req, res){
	connection.query(queries.stores + queries.userName, req.user.username, function(err, rows, fields){
		res.render('createlabels', {
			user : req.user,
			rows : rows[0],
			profile : rows[1][0]
		});
	});
});

router.get('/scanlabels', isLoggedIn, function(req, res){
	connection.query(queries.stores + queries.userName, req.user.username, function(err, rows, fields){
		res.render('scanlabels', {
			user : req.user,
			rows : rows[0],
			profile : rows[1][0]
		});
	});
});

router.get('/printcustomlabels', isLoggedIn, function(req, res){
	res.render('printcustomlabels', {
		user : req.user,
		layout: false
	});	
});

router.get('/printscanlabels', isLoggedIn, function(req, res){
	res.render('printscanlabels', {
		user : req.user,
		layout: false
	});	
});

router.post('/printcustomlabels', function(req, res){
	var quantity = req.body.quantity;
	var code = req.body.code;
	var name = req.body.name;
	var size = req.body.size;
	var print_margin = req.body.print_margin;
	res.render("printcustomlabels", {
		quantity: quantity, 
		code: code, 
		size: size, 
		name: name, 
		print_margin: print_margin, 
		layout: false
	});
});

router.post('/printscanlabels', function(req, res){
	var quantity = req.body.quantity.map((i) => Number(i));
	var code = req.body.code;
	var colorCode = req.body.colorCode;
	var color = req.body.color;
	var name = req.body.name;
	var size = req.body.size;
	res.render("printscanlabels", {
		quantity: quantity, 
		code: code,
		colorCode: colorCode,
		color: color, 
		size: size, 
		name: name, 
		layout: false
	});
});

router.get('/shoelabels', isLoggedIn, function(req, res){
	connection.query(queries.stores + queries.userName, req.user.username, function(err, rows, fields){
		res.render('shoelabels', {
			user : req.user,
			rows : rows[0],
			profile : rows[1][0]
		});
	});
});

router.post('/printshoes', isLoggedIn, function(req, res){
	var quantity = req.body.quantity;
	var color = req.body.color;
	var code = req.body.code;
	var name = req.body.name;
	var size = req.body.size;
	res.render("printshoes", {
		quantity: quantity, 
		color: color, 
		code: code, 
		size: size, 
		name: name, 
		layout: false
	});
});

module.exports = router;