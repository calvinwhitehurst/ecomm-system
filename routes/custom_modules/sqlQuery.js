let connection = require('./connection.js')
let Promise = require('bluebird')
module.exports = sqlQuery = (sql, params) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (err, rows) => {
      if (err) {
        logger.info(err)
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}
