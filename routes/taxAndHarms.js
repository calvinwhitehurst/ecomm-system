const express = require('express')
const router = express.Router()
const isLoggedIn = require('./custom_modules/isLoggedIn.js')
const connection = require('./custom_modules/connection')
const queries = require('./custom_modules/queries.js')

router.get('/codes', isLoggedIn, (req, res) => {
  //move to new js file
  connection.query(
    queries.stores + queries.taxHarmCodes + queries.userName,
    req.user.username,
    (err, rows) => {
      if (err) console.log(err)
      let obj = JSON.parse(JSON.stringify(rows[1]))
      let obj2 = JSON.parse(JSON.stringify(rows[2]))
      res.render('codes', {
        user: req.user,
        obj: obj,
        obj2: obj2,
        rows: rows[0],
        profile: rows[3][0]
      })
    }
  )
})

router.get('/altered', isLoggedIn, (req, res) => {
  //move to new js file
  connection.query(
    queries.stores + queries.alteredCodes + queries.userName,
    req.user.username,
    (err, rows) => {
      if (err) console.log(err)
      res.render('altered', {
        user: req.user,
        rows: rows[0],
        rows2: rows[1],
        profile: rows[2][0]
      })
    }
  )
})

router.post('/addAltered', (req, res) => {
  //move to new js file
  let sku = req.body.sku[0]
  let title = req.body.name[0]
  let post = {
    sku,
    title
  }
  console.log(post)
  connection.query(queries.alteredInsert, post, () => {
    res.redirect('/altered')
  })
})

router.get('/altered/:id', (req, res) => {
  //move to new js file
  let id = req.params.id
  connection.query(queries.alteredDelete, id, () => {
    res.redirect('/altered')
  })
})

router.post('/taxCodes', (req, res) => {
  //move to new js file
  let product = req.body.product
  let tax_code = req.body.tax_code
  let tax_description = req.body.tax_description
  let post = {
    product,
    tax_code,
    tax_description
  }
  connection.query(queries.taxInsert, post, () => {
    res.redirect('/codes')
  })
})

router.get('/taxCode/:id', (req, res) => {
  //move to new js file
  let id = req.params.id
  connection.query(queries.taxDelete, id, () => {
    res.redirect('/codes')
  })
})

router.post('/harmCodes', (req, res) => {
  //move to new js file
  let product = req.body.product
  let harm_code = req.body.harm_code
  let harm_description = req.body.harm_description
  let post = {
    product,
    harm_code,
    harm_description
  }
  connection.query(queries.harmInsert, post, () => {
    res.sendStatus(204)
  })
})

router.get('/harmCodes/:id', (req, res) => {
  //move to new js file
  let id = req.params.id
  connection.query(queries.harmDelete, id, () => {
    res.redirect('/codes')
  })
})

module.exports = router
