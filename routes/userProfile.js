const express = require('express')
const router = express.Router()
const connection = require('./custom_modules/connection')
const isLoggedIn = require('./custom_modules/isLoggedIn.js')
const mustEmp = require('./custom_modules/mustEmp.js')
const queries = require('./custom_modules/queries.js')
const path = require('path')
const multer = require('multer')
const storage = multer.diskStorage({
  destination: path.join(__dirname + './../public/img'),
  filename: (file, cb) => {
    cb(null, file.filename + '-' + Date.now() + path.extname(file.originalname))
  }
})

const upload = multer({ storage: storage })

router.get('/profile', isLoggedIn, mustEmp, (req, res) => {
  let id = req.user.id
  connection.query(
    queries.profile + queries.userName,
    [id, req.user.username],
    (err, rows) => {
      if (err) console.log(err)
      res.render('profile', {
        user: req.user,
        rows: rows[0],
        profile: rows[1][0]
      })
    }
  )
})

router.post('/uploads', (req, res) => {
  upload(req, res, err => {
    if (err) throw err
    let id = req.user.id
    let sql =
      "UPDATE `users` SET `picture` = '" +
      req.file.filename +
      "' WHERE `id` = '" +
      id +
      "'"
    connection.query(sql, () => {
      res.redirect('profile')
    })
  })
})

module.exports = router
