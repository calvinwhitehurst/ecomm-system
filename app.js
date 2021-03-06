const express = require('express')
const app = express()
const session = require('express-session')
const xss = require('xss-clean')
const morgan = require('morgan')
const cors = require('cors')
const bodyParser = require('body-parser')
const passport = require('passport')
const flash = require('connect-flash')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt-nodejs')
const favicon = require('serve-favicon')
const helmet = require('helmet')
const moment = require('moment')
const isLoggedIn = require('./routes/custom_modules/isLoggedIn.js')
const connection = require('./routes/custom_modules/connection.js')
const queries = require('./routes/custom_modules/queries.js')
const sqlQuery = require('./routes/custom_modules/sqlQuery.js')
const httpLogger = require('./routes/httpLogger.js')
require('./config/passport')(passport)
const skipLog = require('./routes/custom_modules/skipLog')
const productview = require('./routes/productview')
const productImg = require('./routes/productimg')
const customerview = require('./routes/customerview')
const orderview = require('./routes/orderview.js')
const printshippinglabels = require('./routes/printshippinglabels')
const printview = require('./routes/printview.js')
const labelsRoutes = require('./routes/labels')
const searchRoutes = require('./routes/search')
const csvRoutes = require('./routes/csvmysql')
const adminRoutes = require('./routes/admin.js')
const userProfile = require('./routes/userProfile.js')
const store = require('./routes/syncToDb.js')
const webhooks = require('./routes/webhooks.js')
const taxAndHarms = require('./routes/taxAndHarms.js')
const passwordreset = require('./routes/passwordreset.js')
const manufacturing = require('./routes/manufacturing.js')
const limit = require('./routes/custom_modules/rateLimit.js')
const sessionVariable = require('./routes/custom_modules/sessionVariable.js')
const numberWithCommas = require('./routes/custom_modules/numberWithCommas')
const printShoesList = require('./routes/printShoesList.js')

connection.connect(err => {
  if (err) throw err
  console.log('MySQL Database is connected.')
})

app.use(httpLogger)
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(helmet({ contentSecurityPolicy: false }))
app.use(require('connect-flash')())
app.use((req, res, next) => {
  res.locals.messages = require('express-messages')(req, res)
  next()
})
app.use(cors())
app.use(morgan('dev', { skip: skipLog }))
app.use(session(sessionVariable))
app.use('/img/*', isLoggedIn)
app.use(xss())
app.use(express.json({ limit: '10kb' }))
app.use(express.static(__dirname + '/public'))
app.use(favicon(__dirname + '/public/img/favicon.ico'))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use(labelsRoutes)
app.use(searchRoutes)
app.use(csvRoutes)
app.use(adminRoutes)
app.use(printshippinglabels)
app.use(userProfile)
app.use(store)
app.use(webhooks)
app.use(passwordreset)
app.use(taxAndHarms)
app.use(manufacturing)
app.use(printShoesList)

app.use('/product_view', productview)
app.use('/productImg', productImg)
app.use('/customer_view', customerview)
app.use('/orders', orderview)
app.use('/print', printview)
app.use('/store', store)
app.set('view engine', 'ejs')
app.set('trust proxy', true)
app.set('port', process.env.PORT || 3000)
app.locals.moment = require('moment')

passport.use(
  'local-login',
  new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password',
      emailField: 'email',
      passReqToCallback: true
    },
    (req, username, password, done) => {
      connection.query(queries.userName, [username], (err, rows) => {
        if (err) done(err)
        if (!rows.length)
          done(null, false, req.flash('loginMessage', 'No user found.'))
        if (!bcrypt.compareSync(password, rows[0].password))
          return done(null, false, req.flash('loginMessage', 'Wrong password.'))
        return done(null, rows[0])
      })
    }
  )
)

app.get('/', (req, res) => {
  connection.query(
    queries.usersCreate +
      queries.usersBase +
      queries.warehouseCreate +
      queries.warehouseBase +
      queries.currencyRateCreate,
    () => {
      res.render('login', {
        message: req.flash('loginMessage')
      })
    }
  )
})

app.get('/home', isLoggedIn, (req, res) => {
  let username = req.user.username
  sqlQuery(
    queries.webhooksCreate +
      queries.storesCreate +
      queries.stores +
      queries.stores +
      queries.userName +
      queries.sales +
      queries.variableTopSellers +
      queries.topSellers +
      queries.unfulfilled +
      queries.combine +
      queries.alteredItems +
      'SELECT sku, COUNT(*) AS amount FROM order_items INNER JOIN orders ON orders.order_id = order_items.order_id WHERE order_items.sku LIKE "ZP%" AND orders.fulfilled <> 1 GROUP BY sku;',
    username
  )
    .then(rows => {
      connection.query(queries.loginUpdate, username, () => {
        let data = []
        let stores = []
        let salesTotal = 0
        for (let i = 0; i < rows[5].length; i++) {
          let name = String(rows[5][i].name)
          let date = moment(rows[5][i].sales_date).format('MM-DD-YY')
          data[i] = {
            [name]: rows[5][i].sales_total,
            sales_date: date
          }
          salesTotal += rows[5][i].sales_total
        }

        for (let j = 0; j < rows[3].length; j++) {
          stores.push(rows[3][j].name)
        }
        salesTotal = Math.round(salesTotal * 100) / 100
        salesTotal = numberWithCommas(salesTotal)
        data = Object.values(
          data.reduce((a, c) => {
            a[c.sales_date] = Object.assign(a[c.sales_date] || {}, c)
            return a
          }, {})
        )
        res.render('home', {
          user: req.user,
          moment: moment,
          rows: rows[2],
          rows2: rows[3],
          rows3: rows[6],
          rows4: rows[7],
          rows5: rows[8],
          rows6: rows[9],
          rows7: rows[10],
          rows8: rows[11],
          dates: [
            { date: moment().format('MMMM Do') },
            {
              date: moment()
                .subtract(30, 'd')
                .format('MMMM Do')
            }
          ],
          profile: rows[4][0],
          data: data,
          stores: stores,
          salesTotal: salesTotal
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

app.get('/altered/(:id)', isLoggedIn, (req, res) => {
  connection.query(
    queries.stores + queries.userName + queries.alteredDelete,
    [req.user.username, req.params.id],
    rows => {
      res.render('altered', {
        user: req.user,
        rows: rows[0]
      })
    }
  )
})

app.post('/home/dates', isLoggedIn, (req, res) => {
  connection.query(
    queries.stores +
      queries.userName +
      "SELECT `sales_date`, `sales_total`, `name` FROM `sales` INNER JOIN `stores` ON sales.store = stores.id WHERE `sales_date` BETWEEN '" +
      moment(new Date(req.body.start_date)).format('YYYY-MM-DD') +
      "' AND '" +
      moment(new Date(req.body.end_date)).format('YYYY-MM-DD') +
      "' ORDER BY `sales_date` ASC, `store` DESC;" +
      "SELECT `sku`, `title`, `variant`, COUNT(item_id) AS amount FROM `order_items` WHERE `date` BETWEEN '" +
      moment(new Date(req.body.start_date)).format('YYYY-MM-DD') +
      "' AND '" +
      moment(new Date(req.body.end_date)).format('YYYY-MM-DD') +
      "' GROUP BY `sku`, `title`, `variant` ORDER BY amount DESC LIMIT 10;" +
      "SELECT `sku`, `title`, `variant`, COUNT(item_id) AS amount FROM `order_items` WHERE `date` BETWEEN '" +
      moment()
        .subtract(30, 'd')
        .format('YYYY-MM-DD') +
      "' AND '" +
      moment().format('YYYY-MM-DD') +
      "' GROUP BY `sku`, `title`, `variant` ORDER BY amount DESC LIMIT 10;",
    queries.topSellers +
      queries.unfulfilled +
      queries.combine +
      queries.alteredItems,
    req.user.username,
    rows => {
      let data = []
      let stores = []
      let salesTotal = 0
      for (let i = 0; i < rows[2].length; i++) {
        let name = String(rows[2][i].name)
        let date = moment(rows[2][i].sales_date).format('MM-DD-YY')
        data[i] = {
          [name]: rows[2][i].sales_total,
          sales_date: date
        }
        salesTotal += rows[2][i].sales_total
      }
      for (let j = 0; j < rows[0].length; j++) {
        stores.push(rows[0][j].name)
      }
      salesTotal = Math.round(salesTotal * 100) / 100
      salesTotal = numberWithCommas(salesTotal)
      data = Object.values(
        data.reduce((a, c) => {
          a[c.sales_date] = Object.assign(a[c.sales_date] || {}, c)
          return a
        }, {})
      )
      res.render('home', {
        user: req.user,
        rows: rows[0],
        rows3: rows[3],
        rows4: rows[4],
        rows5: rows[5],
        rows6: rows[6],
        rows7: rows[7],
        dates: [
          { date: moment(new Date(req.body.start_date)).format('MMMM Do') },
          { date: moment(new Date(req.body.end_date)).format('MMMM Do') }
        ],
        profile: rows[1][0],
        data: data,
        stores: stores,
        salesTotal: salesTotal
      })
    }
  )
})

app.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})

app.post(
  '/',
  limit,
  passport.authenticate('local-login', {
    successRedirect: '/home',
    failureRedirect: '/',
    failureFlash: true
  }),
  res => {
    res.redirect('/home')
  }
)

app.get('/*', res => {
  res.redirect('/')
})

//404 catch-all handler
app.use((req, res) => {
  res.status(404)
  connection.query(
    queries.stores + queries.userName,
    req.user.username,
    rows => {
      res.render('404', {
        rows: rows[0],
        profile: rows[1][0]
      })
    }
  )
})

//500 error handler
app.use((err, req, res) => {
  console.error(err.stack)
  res.status(500)
  connection.query(
    queries.stores + queries.userName,
    req.user.username,
    rows => {
      res.render('500', {
        rows: rows,
        profile: rows[1][0]
      })
    }
  )
})

app.listen(app.get('port'), () => {
  console.log(
    'Express started on http://localhost:' +
      app.get('port') +
      '; press Ctrl-C to terminate.'
  )
})
