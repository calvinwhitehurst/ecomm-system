var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var moment = require("moment");
var isLoggedIn = require("./custom_modules/isLoggedIn.js");
var connection = require("./custom_modules/connection");
var fetchJSON = require("./custom_modules/fetchJSON.js");
var queries = require("./custom_modules/queries.js");
var sqlQuery = require("./custom_modules/sqlQuery.js");
var daysAgo = require("./custom_modules/daysAgo.js");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

module.exports = function (app, passport) {
  app.get("/", function (req, res) {
    connection.query(
      queries.usersCreate +
        queries.usersBase +
        queries.warehouseCreate +
        queries.warehouseBase,
      function () {
        res.render("login", {
          message: req.flash("loginMessage"),
        });
      }
    );
  });

  app.get("/home", isLoggedIn, function (req, res, next) {
    var username = req.user.username;
    sqlQuery(
      queries.webhooksCreate +
        queries.storesCreate +
        queries.stores +
        queries.stores +
        queries.userName,
      username
    )
      .then(function (rows) {
        var data = [];
        for (var i = 0; i < rows[2].length; i++) {
          data.push(
            fetchJSON(
              "https://" +
                rows[2][i].api_key +
                ":" +
                rows[2][i].pswrd +
                "@" +
                rows[2][i].shop_url +
                "/admin/api/2021-04/events.json?filter=Product&verb=published&limit=5"
            )
          );
        }
        connection.query(queries.loginUpdate, username, function () {
          Promise.all(data)
            .then((data) => {
              console.log(data);
              res.render("home", {
                user: req.user,
                data: data,
                moment: moment,
                rows: rows[2],
                rows2: rows[3],
                profile: rows[4][0],
              });
            })
            .catch((err) => console.error("There was a problem", err));
        });
      })
      .error(function (e) {
        console.log("Error handler " + e);
      })
      .catch(function (e) {
        console.log("Catch handler " + e);
      });
  });

  app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
  });

  app.post(
    "/",
    passport.authenticate("local-login", {
      successRedirect: "/home", // redirect to the secure profile section
      failureRedirect: "/", // redirect back to the signup page if there is an error
      failureFlash: true, // allow flash messages
    }),
    function (req, res) {
      if (req.body.remember) {
        req.session.cookie.maxAge = 1000 * 60 * 3;
        bouncer.reset(req);
      } else {
        req.session.cookie.expires = false;
      }
      res.redirect("/");
    }
  );
  app.get("/*", function (req, res) {
    res.redirect("/");
  });
};
