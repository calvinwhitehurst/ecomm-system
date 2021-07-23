var express = require("express");
var router = express.Router();
var passport = require("passport");
var bcrypt = require("bcrypt-nodejs");
var request = require("request");
var LocalStrategy = require("passport-local").Strategy;
var moment = require("moment");
const fetch = require("node-fetch");
var isLoggedIn = require("./custom_modules/isLoggedIn");
var connection = require("./custom_modules/connection");
var queries = require("./custom_modules/queries");
var sqlQuery = require("./custom_modules/sqlQuery.js");
var mustAdmin = require("./custom_modules/mustAdmin.js");
var fetchJSON = require("./custom_modules/fetchJSON.js");
var daysAgo = require("./custom_modules/daysAgo.js");

passport.use(
  "local-signup",
  new LocalStrategy(
    {
      // by default, local strategy uses username and password, we will override with email
      usernameField: "username",
      passwordField: "password",
      emailField: "email",
      passReqToCallback: true, // allows us to pass back the entire request to the callback
    },
    function (req, username, password, done) {
      // find a user whose email is the same as the forms email
      // we are checking to see if the user trying to login already exists
      connection.query(
        "SELECT * FROM users WHERE username = ?",
        [username],
        function (err, rows) {
          if (err) return done(err);
          if (rows.length) {
            return done(
              null,
              false,
              req.flash("signupMessage", "That username is already taken.")
            );
          } else {
            var mysqlTimestamp = moment(Date.now()).format(
              "MMMM Do YYYY, h:mm a"
            ); //get current date
            var picture = "matt.jpg";
            // if there is no user with that username
            // create the user
            var newUserMysql = {
              username: username,
              password: bcrypt.hashSync(password, null, null), // use the generateHash function in our user model
              roles: req.body.roles,
              lastLogin: mysqlTimestamp,
              picture: picture,
              email: req.body.email,
            };

            var insertQuery =
              "INSERT INTO users ( username, password, roles, lastLogin, picture, email ) values (?,?,?,?,?,?)";

            connection.query(
              insertQuery,
              [
                newUserMysql.username,
                newUserMysql.password,
                newUserMysql.roles,
                newUserMysql.lastLogin,
                newUserMysql.picture,
                newUserMysql.email
              ],
              function (err, rows) {
                newUserMysql.id = rows.insertId;

                return done(null, newUserMysql);
              }
            );
          }
        }
      );
    }
  )
);

router.get("/users", isLoggedIn, mustAdmin, function (req, res) {
  connection.query(
    queries.users + queries.userName,
    req.user.username,
    function (err, rows, fields) {
      res.render("users", {
        user: req.user,
        rows: rows[0],
        profile: rows[1][0],
      });
    }
  );
});

router.get("/createuser", isLoggedIn, mustAdmin, function (req, res) {
  connection.query(
    queries.stores + queries.userName,
    req.user.username,
    function (err, rows, fields) {
      res.render("createuser", {
        message: req.flash("signupMessage"),
        user: req.user,
        rows: rows[0],
        profile: rows[1][0],
      });
    }
  );
});

router.post(
  "/createuser",
  passport.authenticate("local-signup", {
    successRedirect: "/logout", // redirect to the secure profile section
    failureRedirect: "/logout", // redirect back to the signup page if there is an error
    failureFlash: true, // allow flash messages
  })
);

router.get("/users/(:id)", function (req, res) {
  //look into more
  var id = req.params.id;
  connection.query(queries.usersid, id, function (error, result) {
    res.redirect("/users");
  });
});

router.get("/settings", isLoggedIn, mustAdmin, function (req, res) {
  connection.query(
    queries.storesCreate +
      queries.stores +
      queries.stores +
      queries.warehouses +
      queries.warehousesExclude +
      queries.userName,
    req.user.username,
    function (err, rows) {
      res.render("settings", {
        user: req.user,
        rows: rows[1],
        rows2: rows[2],
        rows3: rows[3],
        rows4: rows[4],
        profile: rows[5][0],
      });
    }
  );
});

router.post("/settings", function (req, res) {
  var id = req.body.locid;
  var abbrev = req.body.abbrev.replace(/ /g, "_");
  var name = req.body.name;
  var api_key = req.body.api_key;
  var pswrd = req.body.pswrd;
  var shop_url = req.body.shop_url
    .replace(/^(?:https?:\/\/)?(?:www\.)?/i, "")
    .split("/")[0];
  var logo_url = req.body.logo_url;
  var country = req.body.country;
  var email = req.body.email;
  var warehouse = req.body.warehouse;
  var post = {
    id: id,
    abbrev: abbrev,
    name: name,
    api_key: api_key,
    pswrd: pswrd,
    shop_url: shop_url,
    logo_url: logo_url,
    country: country,
    email: email,
    warehouse: warehouse,
  };
  connection.query(queries.storesInsert, post, function (err) {
    if (err) throw err;
    res.redirect("/settings");
  });
});

router.post("/settings/(:id)", function (req, res) {
  var locid = req.body.locid;
  var abbrev = req.body.abbrev;
  var name = req.body.name;
  var api_key = req.body.api_key;
  var pswrd = req.body.pswrd;
  var shop_url = req.body.shop_url
    .replace(/^(?:https?:\/\/)?(?:www\.)?/i, "")
    .split("/")[0];
  var logo_url = req.body.logo_url;
  var country = req.body.country;
  var warehouse = req.body.warehouse;
  var email = req.body.email;
  var id = req.params.id;

  connection.query(
    queries.storesUpdate,
    [
      locid,
      abbrev,
      name,
      api_key,
      pswrd,
      shop_url,
      logo_url,
      country,
      email,
      warehouse,
      id,
    ],
    function (error, results, fields) {
      res.redirect("/settings");
    }
  );
});

router.get("/settings/(:id)", function (req, res) {
  var id = req.params.id;
  connection.query(queries.storesDelete, id, function (error, result) {
    res.redirect("/settings");
  });
});

router.post("/settings/wh/(:id)", function (req, res) {
  var name = req.body.name;
  var shortname = req.body.shortname;
  var id = req.params.id;
  connection.query(queries.warehouseUpdate, [name, shortname, id], function (
    error,
    result
  ) {
    res.redirect("/settings");
  });
});

router.get("/settings/wh/(:id)", function (req, res) {
  var id = req.params.id;
  connection.query(
    queries.warehouseDelete + queries.warehouseDeleteProducts,
    [id, id, id],
    function (error, result) {
      res.redirect("/settings");
    }
  );
});

router.post("/settingswh", function (req, res) {
  var name = req.body.name;
  var shortname = req.body.shortname;
  var post = {
    name,
    shortname,
  };
  connection.query(queries.warehouseInsert, post, function (err) {
    res.redirect("/settings");
  });
});

module.exports = router;
