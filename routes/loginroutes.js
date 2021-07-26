const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const moment = require('moment')
const isLoggedIn = require('./custom_modules/isLoggedIn.js')
const connection = require('./custom_modules/connection')
const fetchJSON = require('./custom_modules/fetchJSON.js')
const queries = require('./custom_modules/queries.js')
const sqlQuery = require('./custom_modules/sqlQuery.js')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

module.exports = (app, passport) => {
  app.get('/', (req, res) => {
    connection.query(
      queries.usersCreate +
        queries.usersBase +
        queries.warehouseCreate +
        queries.warehouseBase,
      () => {
        res.render('login', {
          message: req.flash('loginMessage')
        })
      }
    )
  })

  app.get('/home', isLoggedIn, (req, res) => {
    let username = req.user.username
    sqlQuery(
      queries.webhooksCreate +
        queries.storesCreate +
        queries.stores +
        queries.stores +
        queries.userName,
      username
    )
      .then(rows => {
        let data = []
        for (let i = 0; i < rows[2].length; i++) {
          data.push(
            fetchJSON(
              'https://' +
                rows[2][i].api_key +
                ':' +
                rows[2][i].pswrd +
                '@' +
                rows[2][i].shop_url +
                '/admin/api/2021-04/events.json?filter=Product&verb=published&limit=5'
            )
          )
        }
        connection.query(queries.loginUpdate, username, () => {
          Promise.all(data)
            .then(data => {
              console.log(data)
              res.render('home', {
                user: req.user,
                data: data,
                moment: moment,
                rows: rows[2],
                rows2: rows[3],
                profile: rows[4][0]
              })
            })
            .catch(err => console.error('There was a problem', err))
        })
      })
      .error(e => {
        console.log('Error handler ' + e)
      })
      .catch(e => {
        console.log('Catch handler ' + e)
      })
  })

  app.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/')
  })

  app.post(
    '/',
    passport.authenticate('local-login', {
      successRedirect: '/home',
      failureRedirect: '/',
      failureFlash: true
    }),
    (req, res) => {
      if (req.body.remember) {
        req.session.cookie.maxAge = 1000 * 60 * 3
        bouncer.reset(req)
      } else {
        req.session.cookie.expires = false
      }
      res.redirect('/')
    }
  )
  app.get('/*', res => {
    res.redirect('/')
  })
}
