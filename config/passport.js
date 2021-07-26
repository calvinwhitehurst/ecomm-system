const LocalStrategy = require('passport-local').Strategy
const mysql = require('mysql')
const bcrypt = require('bcrypt-nodejs')
const dbconfig = require('./database')
const connection = mysql.createConnection(dbconfig.connection)

connection.query('USE ' + dbconfig.database)
module.exports = passport => {
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
        connection.query(
          'SELECT * FROM users WHERE username = ?',
          [username],
          (err, rows) => {
            if (err) return done(err)
            if (!rows.length) {
              return done(
                null,
                false,
                req.flash('loginMessage', 'No user found.')
              )
            }
            if (!bcrypt.compareSync(password, rows[0].password))
              return done(
                null,
                false,
                req.flash('loginMessage', 'Oops! Wrong password.')
              )
            return done(null, rows[0])
          }
        )
      }
    )
  )
}
