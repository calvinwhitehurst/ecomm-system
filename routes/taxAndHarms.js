var express = require("express");
var router = express.Router();
var isLoggedIn = require("./custom_modules/isLoggedIn.js");
var connection = require("./custom_modules/connection");
var queries = require("./custom_modules/queries.js");

router.get("/codes", isLoggedIn, function(req, res) {
  //move to new js file
  connection.query(
    queries.stores + queries.taxHarmCodes + queries.userName,
    req.user.username,
    function(err, rows, fields) {
      var obj = JSON.parse(JSON.stringify(rows[1]));
      var obj2 = JSON.parse(JSON.stringify(rows[2]));
      res.render("codes", {
        user: req.user,
        obj: obj,
        obj2: obj2,
        rows: rows[0],
        profile: rows[3][0]
      });
    }
  );
});

router.get("/altered", isLoggedIn, function(req, res) {
  //move to new js file
  connection.query(
    queries.stores + queries.alteredCodes + queries.userName,
    req.user.username,
    function(err, rows, fields) {
      res.render("altered", {
        user: req.user,
        rows: rows[0],
        rows2: rows[1],
        profile: rows[2][0]
      });
    }
  );
});

router.post("/addAltered", function(req, res) {
  //move to new js file
  var sku = req.body.sku[0];
  var title = req.body.name[0];
  var post = {
    sku,
    title
  };
  console.log(post);
  connection.query(queries.alteredInsert, post, function(error, result) {
    res.redirect("/altered");
  });
});

router.get("/altered/:id", function(req, res) {
  //move to new js file
  var id = req.params.id;
  connection.query(queries.alteredDelete, id, function(error, result) {
    res.redirect("/altered");
  });
});


router.post("/taxCodes", function(req, res) {
  //move to new js file
  var product = req.body.product;
  var tax_code = req.body.tax_code;
  var tax_description = req.body.tax_description;
  var post = {
    product,
    tax_code,
    tax_description
  };
  connection.query(queries.taxInsert, post, function(error, result) {
    res.redirect("/codes");
  });
});

router.get("/taxCode/:id", function(req, res) {
  //move to new js file
  var id = req.params.id;
  connection.query(queries.taxDelete, id, function(error, result) {
    res.redirect("/codes");
  });
});

router.post("/harmCodes", function(req, res) {
  //move to new js file
  var product = req.body.product;
  var harm_code = req.body.harm_code;
  var harm_description = req.body.harm_description;
  var post = {
    product,
    harm_code,
    harm_description
  };
  connection.query(queries.harmInsert, post, function(error, result) {
    res.sendStatus(204);
  });
});

router.get("/harmCodes/:id", function(req, res) {
  //move to new js file
  var id = req.params.id;
  connection.query(queries.harmDelete, id, function(error, result) {
    res.redirect("/codes");
  });
});

module.exports = router;
