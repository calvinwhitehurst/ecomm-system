var express = require("express");
var router = express.Router();
var dbsync = require("./custom_modules/dbsync.js");
var sqlQuery = require("./custom_modules/sqlQuery.js");

router.get("/store/:id", function (req, res) {
  sqlQuery("SELECT * FROM `stores` WHERE `id` = ?", req.params.id)
    .then(function (rows) {
      var cred =
        "https://" +
        rows[0].api_key +
        ":" +
        rows[0].pswrd +
        "@" +
        rows[0].shop_url +
        "/admin/api/2021-04/";
      var id = rows[0].id;
      var warehouse = rows[0].warehouse;
      dbsync(cred, id, warehouse);
      res.redirect("/home");
    })
    .error(function (e) {
      console.log("Error handler " + e);
    })
    .catch(function (e) {
      console.log("Catch handler " + e);
    });
});

module.exports = router;
