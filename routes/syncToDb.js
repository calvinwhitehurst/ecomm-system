const express = require('express')
const router = express.Router()
const dbsync = require('./custom_modules/dbsync.js')
const sqlQuery = require('./custom_modules/sqlQuery.js')

router.get('/store/:id', (req, res) => {
  sqlQuery('SELECT * FROM `stores` WHERE `id` = ?', req.params.id)
    .then(rows => {
      let cred =
        'https://' +
        rows[0].api_key +
        ':' +
        rows[0].pswrd +
        '@' +
        rows[0].shop_url +
        '/admin/api/2021-04/'
      let id = rows[0].id
      let warehouse = rows[0].warehouse
      dbsync(cred, id, warehouse)
      res.redirect('/home')
    })
    .error(e => {
      console.log('Error handler ' + e)
    })
    .catch(e => {
      console.log('Catch handler ' + e)
    })
})

module.exports = router
