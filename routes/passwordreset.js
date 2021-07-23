var express = require("express");
var router = express.Router();
var isLoggedIn = require("./custom_modules/isLoggedIn.js");
const nodemailer = require("nodemailer");
var connection = require("./custom_modules/connection");
var bcrypt = require('bcrypt-nodejs');
var moment = require("moment");
var flash = require("connect-flash");
router.use(require("connect-flash")());
router.use(flash());


//var rightnow = moment(Date.now());

function generateToken() {
    var buf = new Buffer.alloc(16);
    for (var i = 0; i < buf.length; i++) {
        buf[i] = Math.floor(Math.random() * 256);
    }
    var id = buf.toString('hex');
    return id;
  }

var transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      type: 'OAuth2',
      user: "calvin@bodyaware.com",
      clientId: "134680859513-li1dfkf9hcdpq0901fhg79ch1qi2hg1o.apps.googleusercontent.com",
      clientSecret: "X9Z81CQ6QDcf_GrUpgK7Go1Z",
      refreshToken: "1//0468PCsWH_3TnCgYIARAAGAQSNwF-L9IrHakZq_KBdbF_-s5LMi8TowCd_-x-KuoaFAk_MkjiZY-zrNZwL-AlTOF2J9hrjJQxQ8U",
    }
  });

router.get('/forgot',function (req, res) {
//UI with one input for email
          res.render('forgot',{
          message: req.flash("onSubmit")});
});

router.get('/noreset',function (req, res) {
    //UI with one input for email
              res.render('noreset');
    });

router.post('/forgot', function (req, res) {
    var token = generateToken();
        connection.query(
            "SELECT * FROM users WHERE email = ?",
            [req.body.email],
            function (err, rows) {
              if (rows.length == 0) {
                  req.flash("onSubmit", "There is no account associated with this email address.")
                  console.log("no user");
                  res.redirect('/forgot');
              } else {
        if (err) {
            req.flash('onSubmit', err);
            console.log("error");
            res.redirect('/forgot');
        }
        else {
            const message = {
                from: 'noreply@bodyaware.info', // Sender address
                to: req.body.email,         // List of recipients
                subject: 'Reset Your Password', // Subject line
                html: '<p>Here is a link to reset your password.<br>  This link will expire in 10 minutes.</p><br><a href="https://bodyaware.info/reset/' + token + '">https://bodyaware.info/reset/' + token + '</a>' // Plain text body
              };
              transport.sendMail(message, function(err, info) {
                if (err) {
                  console.log(err)
                } else {
                  console.log(info);
                }
              });
              var mysqlTimestamp = moment().add(10, 'minutes').toISOString();
            req.flash('onSubmit', 'Please check your email for further instructions.');
            connection.query("UPDATE `users` SET `token` = '" + token + "', `tokenexpir` =  '" + mysqlTimestamp + "' WHERE `email` = ?;", [req.body.email]); 
            res.redirect('/forgot');
        }

    }})
});

router.get('/reset/:token', function (req, res) {
    var token = req.params.token;
    connection.query(
        "SELECT `token`, `tokenexpir` FROM users WHERE token = ?",
        [token],
        function (err, rows) {
            console.log(moment(rows[0].tokenexpir).isBefore(moment().toISOString()));
            if (rows.length == 0 || moment(rows[0].tokenexpir).isBefore(moment().toISOString())) {    
                res.redirect('/noreset');
            } else {
                if (err) {
                    console.log(rows);
                    res.redirect('/');
                } else {
                    res.render('reset', {
                        token: token,
                        message: req.flash("onSubmit")
                    });
                }
            }
    })
});

router.post('/reset/:token', function (req, res) {
    var token = req.params.token;
    var password = bcrypt.hashSync(req.body.password, null, null)
    connection.query(
        "UPDATE `users` SET `password` = '" + password + "' WHERE `token` = ?;", [token], function (err){
            if(err){
                console.log(err)
                req.flash("onSubmit", "Password was not rest.");
                res.redirect('/reset/' + token);
            } else {
                req.flash("loginMessage", "Password was successfully reset.");
                res.redirect('/');
            }
        }
    )
    
    });


module.exports = router;