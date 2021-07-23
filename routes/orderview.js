var express = require("express");
var router = express.Router();
var moment = require("moment");
var request = require("request");
var queries = require("./custom_modules/queries.js");
var daysAgo = require("./custom_modules/daysAgo.js");
var sqlQuery = require("./custom_modules/sqlQuery.js");
var isLoggedIn = require("./custom_modules/isLoggedIn.js");
var mustEmp = require("./custom_modules/mustEmp.js");

router.get("/:id", isLoggedIn, mustEmp, function(req, res, next) {
  sqlQuery(queries.stores + queries.storesWhereId + queries.userName, [
    req.params.id,
    req.user.username
  ])
    .then(function(rows) {
      var queryString =
        "https://" +
        rows[1][0].api_key +
        ":" +
        rows[1][0].pswrd +
        "@" +
        rows[1][0].shop_url +
        "/admin/api/2021-04/orders.json?limit=250&created_at_min=" +
        daysAgo(5);
      request(queryString, function(err, response, body) {
        const data = JSON.parse(body);
        res.render("orderview", {
          user: req.user,
          data: data,
          moment: moment,
          rows: rows[0],
          storeData: rows[1][0],
          profile: rows[2][0]
        });
      });
    })
    .error(function(e) {
      console.log("Error handler " + e);
    })
    .catch(function(e) {
      console.log("Catch handler " + e);
    });
});

module.exports = router;
