const express = require('express')
const router = express.Router()
const moment = require('moment')
const isLoggedIn = require('./custom_modules/isLoggedIn.js')
const fetchJSON = require('./custom_modules/fetchJSON.js')
const sqlQuery = require('./custom_modules/sqlQuery.js')
const queries = require('./custom_modules/queries.js')
const daysAgo = require('./custom_modules/daysAgo.js')
const mustEmp = require('./custom_modules/mustEmp.js')

router.get('/shippingLabels', isLoggedIn, mustEmp, (req, res) => {
  sqlQuery(queries.stores + queries.userName, req.user.username)
    .then((err, rows) => {
      if (err) console.log(err)
      let data = []
      for (let i = 0; i < rows[0].length; i++) {
        if (rows[0][i].country != 2) {
          data.push(
            fetchJSON(
              'https://' +
                rows[0][i].api_key +
                ':' +
                rows[0][i].pswrd +
                '@' +
                rows[0][i].shop_url +
                '/admin/api/2021-04/orders.json?limit=250&created_at_min=' +
                daysAgo(5)
            )
          )
        }
      }
      Promise.all(data)
        .then(data => {
          res.render('shippingLabels', {
            user: req.user,
            data: data,
            moment: moment,
            rows: rows[0],
            profile: rows[1][0]
          })
        })
        .catch(err => console.error('There was a problem', err))
    })
    .error(e => {
      console.log('error handler ' + e)
    })
    .catch(e => {
      console.log('Catch handler ' + e)
    })
})

module.exports = router
