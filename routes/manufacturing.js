const express = require('express')
const router = express.Router()
const connection = require('./custom_modules/connection')
const queries = require('./custom_modules/queries.js')
const isLoggedIn = require('./custom_modules/isLoggedIn.js')
const moment = require('moment')
const mysqlTimestamp = moment(Date.now()).format('MMMM Do YYYY, h:mm a')
const numberWithCommas = require('./custom_modules/numberWithCommas.js')

router.get('/bills', isLoggedIn, (req, res) => {
  connection.query(
    queries.stores + queries.userName + queries.getBills,
    req.user.username,
    (err, rows) => {
      if (err) console.log(err)
      res.render('bills', {
        user: req.user,
        rows: rows[0],
        profile: rows[1][0],
        rows2: rows[2]
      })
    }
  )
})

router.get('/bills/delete/(:id)', (req, res) => {
  connection.query(queries.billsDelete, [req.params.id, req.params.id], err => {
    if (err) console.log(err)
    res.redirect('/bills')
  })
})

router.get('/bills/edit/(:id)', isLoggedIn, (req, res) => {
  connection.query(
    queries.stores + queries.userName + queries.vendors + queries.billsEdit,
    [req.user.username, req.params.id],
    (err, rows) => {
      if (err) console.log(err)
      res.render('billView', {
        user: req.user,
        rows: rows[0],
        profile: rows[1][0],
        rows2: rows[2],
        rows3: rows[3]
      })
    }
  )
})

router.get('/billOfMaterials', isLoggedIn, (req, res) => {
  connection.query(
    queries.stores + queries.userName,
    req.user.username,
    (err, rows) => {
      if (err) console.log(err)
      res.render('billOfMaterials', {
        user: req.user,
        rows: rows[0],
        profile: rows[1][0]
      })
    }
  )
})

router.get('/createBillOfMaterials', isLoggedIn, (req, res) => {
  connection.query(
    queries.stores + queries.userName + queries.vendors + queries.lastBill,
    req.user.username,
    (err, rows) => {
      if (err) console.log(err)
      res.render('createBillOfMaterials', {
        user: req.user,
        rows: rows[0],
        profile: rows[1][0],
        rows2: rows[2],
        rows3: rows[3]
      })
    }
  )
})

router.get('/searchOrderItems', (req, res) => {
  connection.query(
    queries.searchOrderItems +
      req.query.q +
      '%" OR prd_type LIKE "%' +
      req.query.q +
      '%";',
    (err, rows) => {
      if (err) throw err
      let data = {
        results: []
      }
      for (i = 0; i < rows.length; i++) {
        let object = {
          title: rows[i].sku,
          description: `${rows[i].size} ${rows[i].color} ${rows[i].prd_type} - ${rows[i].vendor}`,
          price: '$' + numberWithCommas(rows[i].price)
        }
        data.results.push(object)
      }
      res.send(JSON.stringify(data))
    }
  )
})

router.post('/submitBill', isLoggedIn, (req, res) => {
  let data = [
    mysqlTimestamp,
    req.body.vendor,
    mysqlTimestamp,
    req.body.tracking,
    req.user.username,
    req.body.description,
    req.body.delivered
  ]
  connection.query(
    'INSERT INTO bill_of_materials (date_created, vendor, date_placed, tracking, user, needed_for, delivered) VALUES (?,?,?,?,?,?,?);',
    data
  )
  for (let i = 0; i < req.body.order_items.length; i++) {
    let data2 = [
      req.body.order_items[i].sku,
      req.body.order_items[i].qty,
      req.body.order_items[i].price,
      req.body.number
    ]
    connection.query(
      'INSERT INTO bill_items (sku, qty, total_price, bom_id) VALUES (?,?,?,?);',
      data2
    )
  }
  console.log(req.body)
  res.redirect('/createbillOfMaterials')
})

router.post('/billItemRemove', (req, res) => {
  console.log(req.body.data)
  connection.query('DELETE FROM bill_items WHERE item_id = ?;', req.body.data)
    res.status(200)
})

router.post('/updateBill/(:id)', isLoggedIn, (req, res) => {
  console.log(req.body)
  let data = [
    mysqlTimestamp,
    req.body.vendor[0],
    mysqlTimestamp,
    req.body.tracking,
    req.user.username,
    req.body.description,
    req.body.delivered,
    req.params.id
  ]
  connection.query(
    'UPDATE bill_of_materials SET date_created = ?, vendor = ?, date_placed = ?, tracking = ?, user = ?, needed_for = ?, delivered = ? WHERE id = ?;',
    data
  )
  for (let i = 0; i < req.body.order_items.length; i++) {
    let data2 = [
      req.body.order_items[i].sku,
      req.body.order_items[i].qty,
      req.body.order_items[i].price,
      req.body.number,
      req.params.id
    ]
    connection.query(
      'INSERT INTO bill_items (sku, qty, total_price, bom_id) VALUES (?,?,?,?);',
      data2
    )
  }
  res.redirect('/bills')
})

router.get('/rawGoodsList', isLoggedIn, (req, res) => {
  connection.query(
    queries.stores + queries.vendors + queries.rawGoods + queries.userName,
    req.user.username,
    (err, rows) => {
      if (err) {
        console.log(err)
      } else {
        let data = []
        let items = []
        for (let i = 0; i < rows[1].length; i++) {
          for (let j = 0; j < rows[2].length; j++) {
            if (rows[2][j].vendor == rows[1][i].id) {
              items.push({
                prd_type: rows[2][j].prd_type,
                size: rows[2][j].size,
                color: rows[2][j].color,
                description: rows[2][j].description,
                price: rows[2][j].price,
                sku: rows[2][j].sku,
                measurement: rows[2][j].measurement
              })
            }
          }
          data.push({
            vendor: rows[1][i].name,
            id: rows[1][i].id,
            items: items
          })
          items = []
        }
        res.render('rawGoodsList', {
          user: req.user,
          rows: rows[0],
          data: data,
          profile: rows[3][0]
        })
      }
    }
  )
})

router.get('/rawGoods', isLoggedIn, (req, res) => {
  connection.query(
    queries.stores + queries.vendors + queries.userName,
    req.user.username,
    (err, rows) => {
      if (err) console.log(err)
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
    (err, rows) => {
      if (err) console.log(err)
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
  let id = req.params.id
  connection.query(queries.vendorDelete, id, () => {
    res.redirect('/vendors')
  })
})

module.exports = router
