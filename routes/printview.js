var express = require("express");
var router = express.Router();
var moment = require('moment');
var request = require('request');
var queries = require("./custom_modules/queries.js");
var daysAgo = require("./custom_modules/daysAgo.js");
var sqlQuery = require("./custom_modules/sqlQuery.js");
var isLoggedIn = require("./custom_modules/isLoggedIn.js");
var mustEmp = require("./custom_modules/mustEmp.js");

router.post('/:id', isLoggedIn, mustEmp, function(req, res){
    sqlQuery(queries.stores + queries.storesWhereId, req.params.id)
    .then(function(rows){
        var cred = 'https://' + rows[1][0].api_key + ':' + rows[1][0].pswrd + '@' + rows[1][0].shop_url + '/admin/api/2021-04/';
        if( cred + 'orders/count.json?status=open&created_at_min=' + daysAgo(5) > 1){
            var queryString = bausaCred + 'orders.json?ids=' + req.body.order.map(Number) 
        } else {
            var queryString = cred + 'orders.json?ids=' + req.body.order;   
        }
        request(queryString, function(err, response, body) {
            const data = JSON.parse(body);    
            res.render('printpage', {
                user : req.user,
                data : data,
                moment : moment,
                rows : rows[0],
                storeData : rows[1][0],
                layout : false
            });	
        });	
    })
    .error(function(e){console.log("Error handler " + e)})
    .catch(function(e){console.log("Catch handler " + e)});
});    

module.exports = router;