const express = require('express')
const router = express.Router()
const connection = require('./custom_modules/connection')
const transport = require('./custom_modules/')
const bcrypt = require('bcrypt-nodejs')
const moment = require('moment')
const flash = require('connect-flash')
router.use(require('connect-flash')())
router.use(flash())

generateToken = () => {
  let buf = new Buffer.alloc(16)
  for (let i = 0; i < buf.length; i++) {
    buf[i] = Math.floor(Math.random() * 256)
  }
  id = buf.toString('hex')
  return id
}

router.get('/forgot', (req, res) => {
  res.render('forgot', {
    message: req.flash('onSubmit')
  })
})

router.get('/noreset', res => {
  res.render('noreset')
})

router.post('/forgot', (req, res) => {
  let token = generateToken()
  connection.query(
    'SELECT * FROM users WHERE email = ?',
    [req.body.email],
    (err, rows) => {
      if (rows.length == 0) {
        req.flash(
          'onSubmit',
          'There is no account associated with this email address.'
        )
        console.log('no user')
        res.redirect('/forgot')
      } else {
        if (err) {
          req.flash('onSubmit', err)
          console.log('error')
          res.redirect('/forgot')
        } else {
          const message = {
            from: 'noreply@bodyaware.info',
            to: req.body.email,
            subject: 'Reset Your Password',
            html:
              '<p>Here is a link to reset your password.<br>  This link will expire in 10 minutes.</p><br><a href="https://bodyaware.info/reset/' +
              token +
              '">https://bodyaware.info/reset/' +
              token +
              '</a>'
          }
          transport.sendMail(message, function (err, info) {
            if (err) {
              console.log(err)
            } else {
              console.log(info)
            }
          })
          let mysqlTimestamp = moment()
            .add(10, 'minutes')
            .toISOString()
          req.flash(
            'onSubmit',
            'Please check your email for further instructions.'
          )
          connection.query(
            "UPDATE `users` SET `token` = '" +
              token +
              "', `tokenexpir` =  '" +
              mysqlTimestamp +
              "' WHERE `email` = ?;",
            [req.body.email]
          )
          res.redirect('/forgot')
        }
      }
    }
  )
})

router.get('/reset/:token', (req, res) => {
  let token = req.params.token
  connection.query(
    'SELECT `token`, `tokenexpir` FROM users WHERE token = ?',
    [token],
    (err, rows) => {
      console.log(moment(rows[0].tokenexpir).isBefore(moment().toISOString()))
      if (
        rows.length == 0 ||
        moment(rows[0].tokenexpir).isBefore(moment().toISOString())
      ) {
        res.redirect('/noreset')
      } else {
        if (err) {
          console.log(rows)
          res.redirect('/')
        } else {
          res.render('reset', {
            token: token,
            message: req.flash('onSubmit')
          })
        }
      }
    }
  )
})

router.post('/reset/:token', (req, res) => {
  let token = req.params.token
  let password = bcrypt.hashSync(req.body.password, null, null)
  connection.query(
    "UPDATE `users` SET `password` = '" + password + "' WHERE `token` = ?;",
    [token],
    err => {
      if (err) {
        console.log(err)
        req.flash('onSubmit', 'Password was not rest.')
        res.redirect('/reset/' + token)
      } else {
        req.flash('loginMessage', 'Password was successfully reset.')
        res.redirect('/')
      }
    }
  )
})

module.exports = router
