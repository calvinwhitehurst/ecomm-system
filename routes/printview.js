const express = require('express')
const router = express.Router()
const moment = require('moment')
const request = require('request')
const queries = require('./custom_modules/queries.js')
const daysAgo = require('./custom_modules/daysAgo.js')
const sqlQuery = require('./custom_modules/sqlQuery.js')
const isLoggedIn = require('./custom_modules/isLoggedIn.js')
const mustEmp = require('./custom_modules/mustEmp.js')

router.post('/:id', isLoggedIn, mustEmp, (req, res) => {
  sqlQuery(queries.stores + queries.storesWhereId, req.params.id)
    .then(rows => {
      let cred =
        'https://' +
        rows[1][0].api_key +
        ':' +
        rows[1][0].pswrd +
        '@' +
        rows[1][0].shop_url +
        '/admin/api/2021-04/'
      if (
        cred + 'orders/count.json?status=open&created_at_min=' + daysAgo(5) >
        1
      ) {
        var queryString =
          bausaCred + 'orders.json?ids=' + req.body.order.map(Number)
      } else {
        var queryString = cred + 'orders.json?ids=' + req.body.order
      }
      request(queryString, (err, response, body) => {
        if(err) console.log(err)
        else console.log(response.statusCode)
        const data = JSON.parse(body)
        res.render('printpage', {
          user: req.user,
          data: data,
          moment: moment,
          rows: rows[0],
          storeData: rows[1][0],
          layout: false
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
