const express = require('express')
const router = express.Router()
const isLoggedIn = require('./custom_modules/isLoggedIn.js')
const connection = require('./custom_modules/connection')
const queries = require('./custom_modules/queries.js')

router.get('/:id', isLoggedIn, (req, res) => {
  connection.query(
    queries.stores +
      queries.userName +
      'SELECT pim_id from product_image where pim_prd_id = ?',
    [req.user.username, req.params.id],
    rows => {
      res.render('product_img', {
        user: req.user, // get the user out of session and pass to template
        rows: rows[0],
        rows2: rows[2],
        profile: rows[1][0]
      })
    }
  )
})

module.exports = router
