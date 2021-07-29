const express = require('express')
const isLoggedIn = require('./custom_modules/isLoggedIn.js')
const connection = require('./custom_modules/connection.js')
const queries = require('./custom_modules/queries.js')
const router = express.Router()

router.get('/createlabels', isLoggedIn, (req, res) => {
  connection.query(
    queries.stores + queries.userName,
    req.user.username,
    (err, rows) => {
      if (err) console.log(err)
      res.render('createlabels', {
        user: req.user,
        rows: rows[0],
        profile: rows[1][0]
      })
    }
  )
})

router.get('/scanlabels', isLoggedIn, (req, res) => {
  connection.query(
    queries.stores + queries.userName,
    req.user.username,
    (err, rows) => {
      if (err) console.log(err)
      res.render('scanlabels', {
        user: req.user,
        rows: rows[0],
        profile: rows[1][0]
      })
    }
  )
})

router.get('/printcustomlabels', isLoggedIn, (req, res) => {
  res.render('printcustomlabels', {
    user: req.user,
    layout: false
  })
})

router.get('/printscanlabels', isLoggedIn, (req, res) => {
  res.render('printscanlabels', {
    user: req.user,
    layout: false
  })
})

router.post('/printcustomlabels', (req, res) => {
  let quantity = req.body.quantity
  let code = req.body.code
  let name = req.body.name
  let size = req.body.size
  let print_margin = req.body.print_margin
  res.render('printcustomlabels', {
    quantity: quantity,
    code: code,
    size: size,
    name: name,
    print_margin: print_margin,
    layout: false
  })
})

router.post('/printscanlabels', (req, res) => {
  let quantity = req.body.quantity.map(i => Number(i))
  let code = req.body.code
  let colorCode = req.body.colorCode
  let color = req.body.color
  let name = req.body.name
  let size = req.body.size
  res.render('printscanlabels', {
    quantity: quantity,
    code: code,
    colorCode: colorCode,
    color: color,
    size: size,
    name: name,
    layout: false
  })
})

router.get('/shoelabels', isLoggedIn, (req, res) => {
  connection.query(
    queries.stores + queries.userName,
    req.user.username,
    (err, rows) => {
      if (err) console.log(err)
      res.render('shoelabels', {
        user: req.user,
        rows: rows[0],
        profile: rows[1][0]
      })
    }
  )
})

router.post('/printshoes', isLoggedIn, (req, res) => {
  let quantity = req.body.quantity
  let color = req.body.color
  let code = req.body.code
  let name = req.body.name
  let size = req.body.size
  res.render('printshoes', {
    quantity: quantity,
    color: color,
    code: code,
    size: size,
    name: name,
    layout: false
  })
})

module.exports = router
