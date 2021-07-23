var express = require("express");
var router = express.Router();
var connection = require("./custom_modules/connection");
var isLoggedIn = require("./custom_modules/isLoggedIn.js");
var mustEmp = require("./custom_modules/mustEmp.js");
var queries = require("./custom_modules/queries.js");
var path = require("path");
var multer = require("multer");
var storage = multer.diskStorage({
  destination: path.join(__dirname + "./../public/img"),
  filename: function (req, file, cb) {
    cb(
      null,
      file.filename + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

var upload = multer({ storage: storage });

router.get("/profile", isLoggedIn, mustEmp, function (req, res) {
  var id = req.user.id;
  connection.query(
    queries.profile + queries.userName,
    [id, req.user.username],
    function (err, rows, fields) {
      res.render("profile", {
        user: req.user,
        rows: rows[0],
        profile: rows[1][0],
      });
    }
  );
});

router.post("/uploads", function (req, res) {
  upload(req, res, (err) => {
    if (err) throw err;
    var id = req.user.id;
    var sql =
      "UPDATE `users` SET `picture` = '" +
      req.file.filename +
      "' WHERE `id` = '" +
      id +
      "'";
    connection.query(sql, function (err, results) {
      res.redirect("profile");
    });
  });
});

module.exports = router;
