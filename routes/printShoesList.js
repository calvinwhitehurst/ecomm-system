const express = require('express')
const router = express.Router()
const connection = require('./custom_modules/connection')
const queries = require('./custom_modules/queries.js')
const isLoggedIn = require('./custom_modules/isLoggedIn.js')
const mustEmp = require('./custom_modules/mustEmp.js')

router.get('/printShoesList', isLoggedIn, mustEmp, (req, res) => {
  connection.query(
    queries.stores + queries.userName + queries.getShoesPrint,
    req.user.username,
    (err, rows) => {
      if (err) console.log(err)
      res.render('shoePrintView', {
        user: req.user,
        rows: rows[0],
        profile: rows[1][0],
        rows2: rows[2]
      })
    }
  )
})

module.exports = router
