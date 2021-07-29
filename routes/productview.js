const express = require('express')
const router = express.Router()
const isLoggedIn = require('./custom_modules/isLoggedIn.js')
const connection = require('./custom_modules/connection')
const queries = require('./custom_modules/queries.js')

router.get('/:id', isLoggedIn, (req, res) => {
  connection.query(
    queries.stores + queries.product + queries.userName,
    [req.params.id, req.user.username],
    (err, rows) => {
      if (err) console.log(err)
      res.render('show', {
        user: req.user,
        rows: rows[0],
        prd_id: rows[1][0].prd_id,
        prd_code: rows[1][0].prd_code,
        prd_name: rows[1][0].prd_name,
        prd_desc: rows[1][0].prd_desc,
        profile: rows[2][0]
      })
    }
  )
})

module.exports = router
