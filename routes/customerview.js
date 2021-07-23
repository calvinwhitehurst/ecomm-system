var express = require("express");
var router = express.Router();
var moment = require('moment');
var accounting = require('accounting');
var connection = require("./custom_modules/connection");
var queries = require('./custom_modules/queries.js');
var isLoggedIn = require('./custom_modules/isLoggedIn.js');
var mustEmp = require('./custom_modules/mustEmp.js');

	
router.get('/:id', isLoggedIn, mustEmp, function(req, res){
	connection.query('SELECT usr_standing, usr_fullname, usr_email from user where usr_id = ?; SELECT ads_id, ads_fullname, ads_line1, ads_line2, ads_city, ads_state, ads_zip, ads_country from user_address where ads_usr_id = ?; SELECT nte_id, nte_type, nte_detail, nte_added from note where nte_type_id = ?; SELECT ord_id, ord_web_id, ord_total, ord_balance, ord_status, ord_created from `order` where `ord_usr_id` = ? order by ord_id desc; SELECT orc_ord_id, orc_type, orc_amount, orc_desc, orc_date from order_credit where orc_usr_id = ?; SELECT SUM(ord_total) AS sum FROM `order` WHERE `ord_usr_id` = ? AND `ord_status` = "complete";'  + queries.userName + queries.stores, [req.params.id, req.params.id, req.params.id, req.params.id, req.params.id, req.params.id, req.user.username], function(err, rows, fields) {
		res.render('customer_view', {
			user : req.user,
			obj1: rows[0],
			obj2: rows[1],
			obj3: rows[2],
			obj4: rows[3],
			obj6: rows[5],
			profile : rows[6][0],
			rows : rows[7],
			moment: moment,
			accounting: accounting,	
		});
	});
});


module.exports = router;