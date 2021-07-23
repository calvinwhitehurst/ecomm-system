var express = require("express");
var router = express.Router();
var moment = require("moment");
var connection = require("./custom_modules/connection");
var queries = require("./custom_modules/queries.js");
var isLoggedIn = require("./custom_modules/isLoggedIn.js");

router.get("/bills", isLoggedIn, function(req, res) {
  connection.query(
    queries.stores + queries.userName,
    req.user.username,
    function (err, rows, fields) {
      res.render("bills", {
        user: req.user,
        rows: rows[0],
        profile: rows[1][0],
      });
    }
  );
})

router.get("/rawGoodsList", isLoggedIn, function(req, res) {
  connection.query(
    queries.stores + queries.rawGoods + queries.userName,
    req.user.username,
    function (err, rows, fields) {
      res.render("rawGoodsList", {
        user: req.user,
        rows: rows[0],
        profile: rows[1][0],
      });
    }
  );
})

router.get("/billOfMaterials", isLoggedIn, function(req, res) {
    connection.query(
      queries.stores + queries.userName,
      req.user.username,
      function (err, rows, fields) {
        res.render("billOfMaterials", {
          user: req.user,
          rows: rows[0],
          profile: rows[1][0],
        });
      }
    );
  })

  router.get("/rawGoods", isLoggedIn, function(req, res) {
    connection.query(
      queries.stores + queries.vendors + queries.userName,
      req.user.username,
      function (err, rows, fields) {
        res.render("rawGoods", {
          user: req.user,
          rows: rows[0],
          rows2: rows[1],
          profile: rows[2][0],
        });
      }
    );
  })

  router.post("/addRawGoods", function(req, res) {
    var vendor = req.body.vendor[0];
    var prd_type = req.body.prd_type[0];
    var size = req.body.size[0];
    var color = req.body.color[0];
    var description = req.body.description[0];
    var measurement = req.body.measurement[0];
    var sku = req.body.sku[0];
    var post = {
        vendor,
        prd_type,
        size,
        color,
        description,
        sku,
        measurement,
    };
    connection.query(queries.rawGoodsInsert, post, function(error, result) {
      if(error){
        console.log(error);
      }
      res.redirect("/rawGoods");
    });
  });

  router.get("/vendors", isLoggedIn, function(req, res) {
    connection.query(
      queries.stores + queries.vendors + queries.userName,
      req.user.username,
      function (err, rows, fields) {
        res.render("vendors", {
          user: req.user,
          rows: rows[0],
          rows2: rows[1],
          profile: rows[2][0],
        });
      }
    );
  })

  router.post("/addVendor", function(req, res) {
    var name = req.body.name[0];
    var contact = req.body.contact[0];
    var address = req.body.address[0];
    var phone = req.body.phone[0];
    var email = req.body.email[0];
    var post = {
        name,
        contact,
        address,
        phone,
        email
    };
    console.log(post);
    connection.query(queries.vendorInsert, post, function(error, result) {
      res.redirect("/vendors");
    });
  });
  
  router.get("/vendors/(:id)", function(req, res) {
    //move to new js file
    var id = req.params.id;
    connection.query(queries.vendorDelete, id, function(error, result) {
      res.redirect("/vendors");
    });
  });

module.exports = router;