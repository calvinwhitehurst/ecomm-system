var express = require("express");
var router = express.Router();
var moment = require('moment');
var isLoggedIn = require("./custom_modules/isLoggedIn.js");
var fetchJSON = require("./custom_modules/fetchJSON.js");
var sqlQuery = require("./custom_modules/sqlQuery.js");
var queries = require("./custom_modules/queries.js");
var daysAgo = require("./custom_modules/daysAgo.js");
var mustEmp = require("./custom_modules/mustEmp.js");

router.get('/shippingLabels', isLoggedIn, mustEmp, function(req, res, next){
    sqlQuery(queries.stores + queries.userName, req.user.username)
	.then(function(rows){
		var data = [];
		for(var i =0; i<rows[0].length; i++){
            if(rows[0][i].country !=2){ 
                data.push(fetchJSON("https://" + rows[0][i].api_key + ":" + rows[0][i].pswrd + "@" + rows[0][i].shop_url + "/admin/api/2021-04/orders.json?limit=250&created_at_min=" + daysAgo(5)));
            }
        }
        Promise.all(data).then((data) => {
            res.render('shippingLabels', {
                user : req.user,
                data : data,
                moment : moment,
                rows : rows[0],
                profile : rows[1][0]
            });
        }).catch(err => console.error('There was a problem', err));
    })
    .error(function(e){console.log("error handler " + e)})
    .catch(function(e){console.log("Catch handler " + e)});
});

module.exports = router;