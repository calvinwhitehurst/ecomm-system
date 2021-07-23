var express = require("express");
var router = express.Router();
var isLoggedIn = require("./custom_modules/isLoggedIn.js");
var connection = require("./custom_modules/connection");
var queries = require("./custom_modules/queries.js");

router.get("/:id", isLoggedIn, function (req, res) {
  connection.query(
    queries.stores + queries.product + queries.userName,
    [req.params.id, req.user.username],
    function (err, rows, fields) {
      res.render("show", {
        user: req.user,
        rows: rows[0],
        prd_id: rows[1][0].prd_id,
        prd_code: rows[1][0].prd_code,
        prd_name: rows[1][0].prd_name,
        prd_desc: rows[1][0].prd_desc,
        profile: rows[2][0],
      });
    }
  );
});

module.exports = router;
