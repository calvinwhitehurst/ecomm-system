const express = require('express')
const router = express.Router()
const moment = require('moment')
const request = require('request')
const queries = require('./custom_modules/queries.js')
const daysAgo = require('./custom_modules/daysAgo.js')
const sqlQuery = require('./custom_modules/sqlQuery.js')
const isLoggedIn = require('./custom_modules/isLoggedIn.js')
const mustEmp = require('./custom_modules/mustEmp.js')

router.get('/:id', isLoggedIn, mustEmp, (req, res) => {
  sqlQuery(queries.stores + queries.storesWhereId + queries.userName, [
    req.params.id,
    req.user.username
  ])
    .then((err, rows) => {
      if (err) console.log(err)
      let queryString =
        'https://' +
        rows[1][0].api_key +
        ':' +
        rows[1][0].pswrd +
        '@' +
        rows[1][0].shop_url +
        '/admin/api/2021-04/orders.json?limit=250&created_at_min=' +
        daysAgo(5)
      request(queryString, body => {
        const data = JSON.parse(body)
        res.render('orderview', {
          user: req.user,
          data: data,
          moment: moment,
          rows: rows[0],
          storeData: rows[1][0],
          profile: rows[2][0]
        })
      })
    })
    .error(e => {
      console.log('Error handler ' + e)
    })
    .catch(e => {
      console.log('Catch handler ' + e)
    })
})

module.exports = router
