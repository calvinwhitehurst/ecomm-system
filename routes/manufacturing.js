const express = require('express')
const router = express.Router()
const connection = require('./custom_modules/connection')
const queries = require('./custom_modules/queries.js')
const isLoggedIn = require('./custom_modules/isLoggedIn.js')

router.get('/bills', isLoggedIn, (req, res) => {
  connection.query(
    queries.stores + queries.userName,
    req.user.username,
    rows => {
      res.render('bills', {
        user: req.user,
        rows: rows[0],
        profile: rows[1][0]
      })
    }
  )
})

router.get('/rawGoodsList', isLoggedIn, (req, res) => {
  connection.query(
    queries.stores + queries.rawGoods + queries.userName,
    req.user.username,
    rows => {
      res.render('rawGoodsList', {
        user: req.user,
        rows: rows[0],
        profile: rows[1][0]
      })
    }
  )
})

router.get('/billOfMaterials', isLoggedIn, (req, res) => {
  connection.query(
    queries.stores + queries.userName,
    req.user.username,
    rows => {
      res.render('billOfMaterials', {
        user: req.user,
        rows: rows[0],
        profile: rows[1][0]
      })
    }
  )
})

router.get('/rawGoods', isLoggedIn, (req, res) => {
  connection.query(
    queries.stores + queries.vendors + queries.userName,
    req.user.username,
    rows => {
      res.render('rawGoods', {
        user: req.user,
        rows: rows[0],
        rows2: rows[1],
        profile: rows[2][0]
      })
    }
  )
})

router.post('/addRawGoods', (req, res) => {
  let vendor = req.body.vendor[0]
  let prd_type = req.body.prd_type[0]
  let size = req.body.size[0]
  let color = req.body.color[0]
  let description = req.body.description[0]
  let measurement = req.body.measurement[0]
  let sku = req.body.sku[0]
  let post = {
    vendor,
    prd_type,
    size,
    color,
    description,
    sku,
    measurement
  }
  connection.query(queries.rawGoodsInsert, post, error => {
    if (error) {
      console.log(error)
    }
    res.redirect('/rawGoods')
  })
})

router.get('/vendors', isLoggedIn, (req, res) => {
  connection.query(
    queries.stores + queries.vendors + queries.userName,
    req.user.username,
    rows => {
      res.render('vendors', {
        user: req.user,
        rows: rows[0],
        rows2: rows[1],
        profile: rows[2][0]
      })
    }
  )
})

router.post('/addVendor', (req, res) => {
  let name = req.body.name[0]
  let contact = req.body.contact[0]
  let address = req.body.address[0]
  let phone = req.body.phone[0]
  let email = req.body.email[0]
  let post = {
    name,
    contact,
    address,
    phone,
    email
  }
  console.log(post)
  connection.query(queries.vendorInsert, post, () => {
    res.redirect('/vendors')
  })
})

router.get('/vendors/(:id)', (req, res) => {
  //move to new js file
  let id = req.params.id
  connection.query(queries.vendorDelete, id, () => {
    res.redirect('/vendors')
  })
})

module.exports = router
