const express = require('express')
const router = express.Router()
const isLoggedIn = require('./custom_modules/isLoggedIn.js')
const connection = require('./custom_modules/connection')
const queries = require('./custom_modules/queries.js')

router.get('/access', isLoggedIn, (req, res) => {
  //look at later
  connection.query(
    queries.stores + queries.userName,
    req.user.username,
    (err, rows) => {
      if (err) console.log(err)
      res.render('access', {
        user: req.user,
        rows: rows[0],
        profile: rows[1][0]
      })
    }
  )
})

//////SEARCH ROUTES//////

router.get('/search', (req, res) => {
  connection.query(
    queries.searchCodes +
      req.query.q +
      '%" OR prd_code LIKE "%' +
      req.query.q +
      '%"',
    (err, rows) => {
      if (err) throw err
      let data = {
        results: []
      }
      for (i = 0; i < rows.length; i++) {
        let object = {
          title: rows[i].prd_code,
          description: rows[i].prd_name
        }
        data.results.push(object)
      }
      res.send(JSON.stringify(data))
    }
  )
})

router.post('/search', (req, res) => {
  connection.query(
    queries.stores +
      'SELECT `prd_id`, `prd_code`, `prd_name`, `pim_id` FROM `product` JOIN `product_image` ON `prd_id` = `pim_prd_id` WHERE `prd_code` LIKE "%' +
      req.body.search +
      '%" OR `prd_name` LIKE "%' +
      req.body.search +
      '%" GROUP BY `prd_id`;' +
      queries.userName,
    req.user.username,
    (err, rows) => {
      if (err) {
        console.log(err)
      } else {
        let obj = JSON.parse(JSON.stringify(rows[1]))
        res.render('product_search_table', {
          obj: obj,
          rows: rows[0],
          profile: rows[2][0]
        })
      }
    }
  )
})

///////OLD PRODUCT SEARCH ROUTES///////

router.get('/productsearch', isLoggedIn, (req, res) => {
  connection.query(
    queries.stores + queries.userName,
    req.user.username,
    (err, rows) => {
      if (err) console.log(err)
      res.render('productsearch', {
        user: req.user,
        rows: rows[0],
        profile: rows[1][0]
      })
    }
  )
})

router.get('/product_search_table', isLoggedIn, (req, res) => {
  connection.query(
    queries.stores + queries.userName,
    req.user.username,
    (err, rows) => {
      if (err) console.log(err)
      res.render('product_search_table', {
        user: req.user,
        rows: rows[0],
        profile: rows[1][0]
      })
    }
  )
})

router.get('/product_search_table', (req, res) => {
  connection.query(
    queries.typeAheadProduct + req.query.key + '%" LIMIT 1;',
    (err, rows) => {
      if (err) throw err
      let data = []
      for (i = 0; i < rows.length; i++) {
        data.push(rows[i].pim_id)
      }
      res.end(JSON.stringify(data))
    }
  )
})

///////OLD CUSTOMER SEARCH ROUTES/////////

router.get('/searchcustomer', (req, res) => {
  connection.query(queries.typeAheadName + req.query.q + '%"', (err, rows) => {
    if (err) throw err
    let data = {
      results: []
    }
    for (i = 0; i < rows.length; i++) {
      let object = {
        title: rows[i].usr_fullname
      }
      data.results.push(object)
    }
    res.end(JSON.stringify(data))
  })
})

router.post('/searchcustomer', (req, res) => {
  connection.query(
    queries.stores +
      queries.searchName +
      req.body.search +
      '%";' +
      queries.userName,
    req.user.username,
    (err, rows) => {
      if (err) console.log(err)
      let obj = JSON.parse(JSON.stringify(rows[1]))
      res.render('customer_search_table', {
        obj: obj,
        rows: rows[0],
        profile: rows[2][0]
      })
    }
  )
})

router.get('/customersearch', isLoggedIn, (req, res) => {
  connection.query(
    queries.stores + queries.userName,
    req.user.username,
    (err, rows) => {
      if (err) console.log(err)
      res.render('customersearch', {
        user: req.user,
        rows: rows[0],
        profile: rows[1][0]
      })
    }
  )
})

router.get('/customer_search_table', isLoggedIn, (req, res) => {
  connection.query(
    queries.stores + queries.userName,
    req.user.username,
    (err, rows) => {
      if (err) console.log(err)
      res.render('customer_search_table', {
        user: req.user,
        rows: rows[0],
        profile: rows[1][0]
      })
    }
  )
})

////////// INVENTORY DB SEARCH ROUTES ///////////
router.get('/searchdb', (req, res) => {
  connection.query(
    queries.searchCodes +
      req.query.q +
      '%" OR prd_code LIKE "%' +
      req.query.q +
      '%"',
    (err, rows) => {
      if (err) throw err
      let data = {
        results: []
      }
      for (i = 0; i < rows.length; i++) {
        let object = {
          title: rows[i].prd_code,
          description: rows[i].prd_name
        }
        data.results.push(object)
      }
      res.send(JSON.stringify(data))
    }
  )
})

router.get('/searchcodes', (req, res) => {
  connection.query(
    queries.searchCodes +
      req.query.q +
      '%" OR prd_code LIKE "%' +
      req.query.q +
      '%"',
    (err, rows) => {
      if (err) throw err
      let data = {
        results: []
      }
      for (i = 0; i < rows.length; i++) {
        let object = {
          title: rows[i].prd_code,
          description: rows[i].prd_name
        }
        data.results.push(object)
      }
      res.send(JSON.stringify(data))
    }
  )
})

router.get('/lookupUk/:id', (req, res) => {
  connection.query(queries.ukLookup, req.params.id, (err, rows) => {
    if (err) throw err
    if (typeof rows[0] !== 'undefined') {
      let data = rows[0].uk_sku
      console.log(rows[0].uk_sku)
      res.send(data)
    } else {
      res.sendStatus(200)
    }
  })
})

router.get('/addAltered', (req, res) => {
  connection.query(
    queries.searchCodes +
      req.query.q +
      '%" OR prd_code LIKE "%' +
      req.query.q +
      '%"',
    (err, rows) => {
      if (err) throw err
      let data = {
        results: []
      }
      for (i = 0; i < rows.length; i++) {
        let object = {
          title: rows[i].prd_code,
          description: rows[i].prd_name
        }
        data.results.push(object)
      }
      res.send(JSON.stringify(data))
    }
  )
})

router.post('/searchdb', (req, res) => {
  connection.query(
    queries.stores +
      'SELECT `prd_id`, `prd_code`, `prd_name`, `pim_id` FROM `product` JOIN `product_image` ON `prd_id` = `pim_prd_id` WHERE `prd_code` LIKE "%' +
      req.body.search +
      '%" OR `prd_name` LIKE "%' +
      req.body.search +
      '%" GROUP BY `prd_id`;' +
      queries.searchInventory +
      ' "%' +
      req.body.search +
      '%";' +
      queries.userName,
    req.user.username,
    (err, rows) => {
      if (err) {
        console.log(err)
      } else {
        let obj = JSON.parse(JSON.stringify(rows[1]))
        let obj2 = JSON.parse(JSON.stringify(rows[2]))
        res.render('product_search_table', {
          obj: obj,
          obj2: obj2,
          rows: rows[0],
          profile: rows[3][0]
        })
      }
    }
  )
})

router.get('/inventoryresults', (req, res) => {
  connection.query(
    queries.stores + queries.userName,
    req.user.username,
    (err, rows) => {
      if (err) console.log(err)
      res.render('inventoryresults', {
        rows: rows[0],
        profile: rows[1][0]
      })
    }
  )
})

module.exports = router
