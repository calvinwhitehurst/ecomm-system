var express = require("express");
var app = express();
var session = require("express-session");
var fs = require("fs");
var xss = require("xss-clean");
var morgan = require("morgan");
var cors = require("cors");
var bodyParser = require("body-parser");
var passport = require("passport");
var flash = require("connect-flash");
var LocalStrategy = require("passport-local").Strategy;
var bcrypt = require("bcrypt-nodejs");
var favicon = require("serve-favicon");
var helmet = require("helmet");
var MySQLStore = require("express-mysql-session")(session);
var moment = require("moment");
const rateLimit = require("express-rate-limit");

var isLoggedIn = require("./routes/custom_modules/isLoggedIn.js");
var connection = require("./routes/custom_modules/connection");
var fetchJSON = require("./routes/custom_modules/fetchJSON.js");
var queries = require("./routes/custom_modules/queries.js");
var sqlQuery = require("./routes/custom_modules/sqlQuery.js");
var daysAgo = require("./routes/custom_modules/daysAgo.js");
const httpLogger = require("./routes/httpLogger.js");

app.use(httpLogger);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var productview = require("./routes/productview");
var productImg = require("./routes/productimg");
var customerview = require("./routes/customerview");
var orderview = require("./routes/orderview.js");
var printshippinglabels = require("./routes/printshippinglabels");
var printview = require("./routes/printview.js");
var labelsRoutes = require("./routes/labels");
var searchRoutes = require("./routes/search");
var csvRoutes = require("./routes/csvmysql");
var adminRoutes = require("./routes/admin.js");
var userProfile = require("./routes/userProfile.js");
var store = require("./routes/syncToDb.js");
var webhooks = require("./routes/webhooks.js");
var taxAndHarms = require("./routes/taxAndHarms.js");
var connection = require("./routes/custom_modules/connection.js");
var queries = require("./routes/custom_modules/queries.js");
var passwordreset = require("./routes/passwordreset.js");
var manufacturing = require("./routes/manufacturing.js");

const limit = rateLimit({
  max: 30, // max requests
  windowMs: 60 * 60 * 1000, // 1 Hour
  message: '<!DOCTYPE html><html><head><title>Body Aware Central</title><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/semantic-ui@2.3.1/dist/semantic.min.css"><script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script><script src="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/1.11.8/semantic.min.js"></script><meta name="robots" content="noindex"><style type="text/css">body {background-color: #DADADA;}</style></head><body><div style="margin: 10% auto; width: 50%; text-align: center;" class="ui negative message"><div class="header">Sorry you have used too many attempts to login.</div><p>Please contact the web adminstrator.</p></div></body></html>' // message to send
});

connection.connect(function (err) {
  if (err) throw err;
  console.log("MySQL Database is connected.");
});

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(require("connect-flash")());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

require("./config/passport")(passport);

app.set("view engine", "ejs");
app.set("trust proxy", true);
app.set("port", process.env.PORT || 3000);
app.locals.moment = require("moment");
app.use(cors());

function skipLog(req, res) {
  var url = req.url;
  if (url.indexOf("?") > 0) url = url.substr(0, url.indexOf("?"));
  if (url.match(/(js|jpg|png|ico|css|woff|woff2|eot)$/gi)) {
    return true;
  }
  return false;
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

app.use(morgan("dev", { skip: skipLog }));
var options = {
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "controlcenter",
  clearExpired: true,
  checkExpirationInterval: 900000,
  expiration: 1800000,
  endConnectionOnClose: true,
};

var sessionStore = new MySQLStore(options);
//app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  session({
    key: "session_cookie_name",
    secret: "vidyapathaisalwaysrunning",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1800000,
      //path: "/",
      //sameSite: true,
      //secure: true,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(labelsRoutes);
app.use(searchRoutes);
app.use(csvRoutes);
app.use(adminRoutes);
app.use(printshippinglabels);
app.use(userProfile);
app.use(store);
app.use(webhooks);
app.use(passwordreset);
app.use(taxAndHarms);
app.use(manufacturing);

app.use("/product_view", productview);
app.use("/productImg", productImg);
app.use("/customer_view", customerview);
app.use("/orders", orderview);
app.use("/print", printview);
app.use("/store", store);

// ////////////////////////////////////////////////////////////

passport.use(
  'local-login',
  new LocalStrategy({
      // by default, local strategy uses username and password, we will override with email
      usernameField : 'username',
      passwordField : 'password',
      emailField : 'email',
      passReqToCallback : true // allows us to pass back the entire request to the callback
  },
  function(req, username, password, done) { // callback with email and password from our form

      connection.query(queries.userName,[username], function(err, rows){
          if (err)
              return done(err);
          if (!rows.length) {
              return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
          }

          // if the user is found but the password is wrong
          if (!bcrypt.compareSync(password, rows[0].password))
              return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

          // all is well, return successful user
          return done(null, rows[0]);
      });
  })
);


app.use('/img/*', isLoggedIn);
app.use(xss());
app.use(express.json({ limit: '10kb' }));  //body limit is 10kb
app.use(express.static(__dirname + "/public"));
app.use(favicon(__dirname + "/public/img/favicon.ico"));

//require("./routes/loginroutes.js")(app, passport);
app.get("/", function (req, res) {
  connection.query(
    queries.usersCreate +
      queries.usersBase +
      queries.warehouseCreate +
      queries.warehouseBase +
      queries.currencyRateCreate,
    function () {
      res.render("login", {
        message: req.flash("loginMessage"),
      });
    }
  );
});

app.get("/home", isLoggedIn, function (req, res) {
  var username = req.user.username;
  sqlQuery(
    queries.webhooksCreate +
      queries.storesCreate +
      queries.stores +
      queries.stores +
      queries.userName +
      "SELECT `sales_date`, `sales_total`, `name` FROM `sales` INNER JOIN `stores` ON sales.store = stores.id WHERE `sales_date` BETWEEN '" + moment().subtract(30, 'd').format('YYYY-MM-DD') + "' AND '" + moment().format('YYYY-MM-DD') + "' ORDER BY `sales_date` ASC, `store` DESC;" +
      "SELECT `sku`, `title`, `variant`, COUNT(item_id) AS amount FROM `order_items` WHERE `date` BETWEEN '" + moment().subtract(30, 'd').format('YYYY-MM-DD') + "' AND '" + moment().format('YYYY-MM-DD') + "' GROUP BY `sku`, `title`, `variant` ORDER BY amount DESC LIMIT 10;" + 
      "SELECT `sku`, `title`, `variant`, COUNT(item_id) AS amount FROM `order_items` GROUP BY `sku`, `title`, `variant` ORDER BY amount DESC LIMIT 10;" + 
      "SELECT `store`, `name`, COUNT(order_id) AS total FROM `orders`, `stores` WHERE orders.store = stores.id AND fulfilled = 0 AND date <> 'NULL' GROUP BY `store`;" +
      "SELECT `customer`, `order_id` FROM `orders` WHERE `customer` IN (SELECT `customer` FROM `orders` JOIN `stores` ON `store` = `id` WHERE `fulfilled` <> 1 AND `country` = 1 GROUP BY `customer` HAVING COUNT(*) > 1) AND `fulfilled` <> 1 ORDER BY `customer` DESC;" +
      "SELECT a.sku, COUNT(*) AS amount FROM altered AS a JOIN order_items AS oi ON a.sku = oi.sku JOIN orders AS o ON o.order_id = oi.order_id JOIN stores AS s ON o.store = s.id WHERE o.fulfilled <> 1 AND s.country = 1 GROUP BY a.sku;",
    username
  )
    .then(function (rows) {
      connection.query(queries.loginUpdate, username, function () {
        let data = [];
        let stores = [];
        let salesTotal = 0;
        for(let i = 0;i < rows[5].length; i++){
          let name = String(rows[5][i].name);
          let date = moment(rows[5][i].sales_date).format('MM-DD-YY');
          data[i] = {
            [name] : rows[5][i].sales_total,
            'sales_date' : date
          }
          salesTotal += rows[5][i].sales_total;
        }

        for(let j = 0;j < rows[3].length; j++){
          stores.push(rows[3][j].name);
        }
        salesTotal = Math.round(salesTotal * 100) / 100
        salesTotal = numberWithCommas(salesTotal);
        data = Object.values(data.reduce((a, c) => {
          a[c.sales_date] = Object.assign(a[c.sales_date] || {}, c);
          return a;
        }, {}));
        res.render("home", {
          user: req.user,
          moment: moment,
          rows: rows[2],
          rows2: rows[3],
          rows3: rows[6],
          rows4: rows[7],
          rows5: rows[8],
          rows6: rows[9],
          rows7: rows[10],
          dates: [
            { date: moment().format('MMMM Do') }, 
            { date: moment().subtract(30, 'd').format('MMMM Do') }
          ],
          profile: rows[4][0],
          data: data,
          stores: stores,
          salesTotal: salesTotal
        });
      });
    })
    .error(function (e) {
      console.log("Error handler " + e);
    })
    .catch(function (e) {
      console.log("Catch handler " + e);
    });
});
app.get("/altered/(:id)", isLoggedIn, function (req, res){
  connection.query(queries.stores + queries.userName + queries.alteredDelete, [req.user.username, req.params.id],
    function(err, rows, fields){
      res.render("altered", {
          user: req.user,
          rows: rows[0],
      })
  });
});

app.post("/home/dates", isLoggedIn, function (req, res) {
  connection.query(
    queries.stores + queries.userName + "SELECT `sales_date`, `sales_total`, `name` FROM `sales` INNER JOIN `stores` ON sales.store = stores.id WHERE `sales_date` BETWEEN '" + moment(new Date(req.body.start_date)).format('YYYY-MM-DD') + "' AND '" + moment(new Date(req.body.end_date)).format('YYYY-MM-DD') + "' ORDER BY `sales_date` ASC, `store` DESC;" +
    "SELECT `sku`, `title`, `variant`, COUNT(item_id) AS amount FROM `order_items` WHERE `date` BETWEEN '" + moment(new Date(req.body.start_date)).format('YYYY-MM-DD') + "' AND '" + moment(new Date(req.body.end_date)).format('YYYY-MM-DD') + "' GROUP BY `sku`, `title`, `variant` ORDER BY amount DESC LIMIT 10;" +
    "SELECT `sku`, `title`, `variant`, COUNT(item_id) AS amount FROM order_items GROUP BY `sku`, `title`, `variant` ORDER BY amount DESC LIMIT 10;" +
    "SELECT `store`, `name`, COUNT(order_id) AS total FROM `orders`, `stores` WHERE orders.store = stores.id AND fulfilled = 0 AND date <> 'NULL' GROUP BY `store`;" +
    "SELECT `customer`, `order_id` FROM `orders` WHERE `customer` IN (SELECT `customer` FROM `orders` JOIN `stores` ON `store` = `id` WHERE `fulfilled` <> 1 AND `country` = 1 GROUP BY `customer` HAVING COUNT(*) > 1) AND `fulfilled` <> 1 ORDER BY `customer` DESC;" +
    "SELECT a.sku, COUNT(*) AS amount FROM altered AS a JOIN order_items AS oi ON a.sku = oi.sku JOIN orders AS o ON o.order_id = oi.order_id JOIN stores AS s ON o.store = s.id WHERE o.fulfilled <> 1 AND s.country = 1 GROUP BY a.sku;",
    req.user.username,
    function (err, rows, fields) {
      let data = [];
      let stores = [];
      let salesTotal = 0;
      for(let i = 0;i < rows[2].length; i++){
        let name = String(rows[2][i].name);
        let date = moment(rows[2][i].sales_date).format('MM-DD-YY');
        data[i] = {
          [name] : rows[2][i].sales_total,
          'sales_date' : date
        }
        salesTotal += rows[2][i].sales_total;
      }

      for(let j = 0;j < rows[0].length; j++){
        stores.push(rows[0][j].name);
      }
      salesTotal = Math.round(salesTotal * 100) / 100
      salesTotal = numberWithCommas(salesTotal);
      data = Object.values(data.reduce((a, c) => {
        a[c.sales_date] = Object.assign(a[c.sales_date] || {}, c);
        return a;
      }, {}));
      res.render("home", {
        user: req.user,
        rows: rows[0],
        rows3: rows[3],
        rows4: rows[4],
        rows5: rows[5],
        rows6: rows[6],
        rows7: rows[7],
        dates: [
          { date: moment(new Date(req.body.start_date)).format('MMMM Do') }, 
          { date: moment(new Date(req.body.end_date)).format('MMMM Do') }
        ],
        profile: rows[1][0],
        data: data,
        stores: stores,
        salesTotal: salesTotal
      });
    }
  );
});

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

app.post(
  "/", limit,
  passport.authenticate("local-login", {
    successRedirect: "/home", // redirect to the secure profile section
    failureRedirect: "/", // redirect back to the signup page if there is an error
    failureFlash: true, // allow flash messages
  }), function(req, res){
    res.redirect("/home")
});


app.get("/*", function (req, res) {
  res.redirect("/");
});

//404 catch-all handler (middleware)
app.use(function (req, res, next) {
  res.status(404);
  connection.query(
    queries.stores + queries.userName,
    req.user.username,
    function (err, rows, fields) {
      res.render("404", {
        rows: rows[0],
        profile: rows[1][0],
      });
    }
  );
});

//500 error handler (middleware)
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500);
  connection.query(
    queries.stores + queries.userName,
    req.user.username,
    function (err, rows, fields) {
      res.render("500", {
        rows: rows,
        profile: rows[1][0],
      });
    }
  );
});

app.listen(app.get("port"), function () {
  console.log(
    "Express started on http://localhost:" +
      app.get("port") +
      "; press Ctrl-C to terminate."
  );
});
