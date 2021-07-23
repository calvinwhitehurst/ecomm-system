const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcrypt-nodejs");
const LocalStrategy = require("passport-local").Strategy;
const moment = require("moment");
const isLoggedIn = require("./custom_modules/isLoggedIn");
const connection = require("./custom_modules/connection");
const queries = require("./custom_modules/queries");
const mustAdmin = require("./custom_modules/mustAdmin.js");

passport.use(
  "local-signup",
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
      emailField: "email",
      passReqToCallback: true,
    },
    (req, username, password, done) => {
      connection.query(
        "SELECT * FROM users WHERE username = ?",
        [username],
        (err, rows) => {
          if (err) return done(err);
          if (rows.length) {
            return done(
              null,
              false,
              req.flash("signupMessage", "That username is already taken.")
            );
          } else {
            let mysqlTimestamp = moment(Date.now()).format(
              "MMMM Do YYYY, h:mm a"
            ); 
            let picture = "matt.jpg";
            let newUserMysql = {
              username: username,
              password: bcrypt.hashSync(password, null, null),
              roles: req.body.roles,
              lastLogin: mysqlTimestamp,
              picture: picture,
              email: req.body.email,
            };
            let insertQuery =
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
              (rows) => {
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

router.get("/users", isLoggedIn, mustAdmin, (req, res) => {
  connection.query(
    queries.users + queries.userName,
    req.user.username,
    (rows) => {
      res.render("users", {
        user: req.user,
        rows: rows[0],
        profile: rows[1][0],
      });
    }
  );
});

router.get("/createuser", isLoggedIn, mustAdmin, (req, res) => {
  connection.query(
    queries.stores + queries.userName,
    req.user.username,
    (rows) => {
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

router.get("/users/(:id)", (res) => {
  connection.query(queries.usersid, id, () => {
    res.redirect("/users");
  });
});

router.get("/settings", isLoggedIn, mustAdmin, (req, res) => {
  connection.query(
    queries.storesCreate +
      queries.stores +
      queries.stores +
      queries.warehouses +
      queries.warehousesExclude +
      queries.userName,
    req.user.username,
    (rows) => {
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

router.post("/settings", (req, res) => {
  let id = req.body.locid;
  let abbrev = req.body.abbrev.replace(/ /g, "_");
  let name = req.body.name;
  let api_key = req.body.api_key;
  let pswrd = req.body.pswrd;
  let shop_url = req.body.shop_url
    .replace(/^(?:https?:\/\/)?(?:www\.)?/i, "")
    .split("/")[0];
  let logo_url = req.body.logo_url;
  let country = req.body.country;
  let email = req.body.email;
  let warehouse = req.body.warehouse;
  let post = {
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
  connection.query(queries.storesInsert, post, (err) => {
    if (err) throw err;
    res.redirect("/settings");
  });
});

router.post("/settings/(:id)", (req, res) => {
  let locid = req.body.locid;
  let abbrev = req.body.abbrev;
  let name = req.body.name;
  let api_key = req.body.api_key;
  let pswrd = req.body.pswrd;
  let shop_url = req.body.shop_url
    .replace(/^(?:https?:\/\/)?(?:www\.)?/i, "")
    .split("/")[0];
  let logo_url = req.body.logo_url;
  let country = req.body.country;
  let warehouse = req.body.warehouse;
  let email = req.body.email;
  let id = req.params.id;
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
    () => {
      res.redirect("/settings");
    }
  );
});

router.get("/settings/(:id)", (req, res) => {
  let id = req.params.id;
  connection.query(queries.storesDelete, id, () => {
    res.redirect("/settings");
  });
});

router.post("/settings/wh/(:id)", (req, res) => {
  let name = req.body.name;
  let shortname = req.body.shortname;
  let id = req.params.id;
  connection.query(queries.warehouseUpdate, [name, shortname, id], () => {
    res.redirect("/settings");
  });
});

router.get("/settings/wh/(:id)", (req, res) => {
  let id = req.params.id;
  connection.query(
    queries.warehouseDelete + queries.warehouseDeleteProducts,
    [id, id, id],
    () => {
      res.redirect("/settings");
    }
  );
});

router.post("/settingswh", (req, res) => {
  let name = req.body.name;
  let shortname = req.body.shortname;
  let post = {
    name,
    shortname,
  };
  connection.query(queries.warehouseInsert, post, () => {
    res.redirect("/settings");
  });
});

module.exports = router;
