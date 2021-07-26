const connection = require('./connection')
const Promise = require('promise')
const queries = require('./queries.js')

module.exports = query = () => {
  return new Promise((resolve, reject) => {
    connection.query(queries.stores, (err, rows) => {
      if (rows === undefined) {
        reject(new err('Error rows are undefined'))
      } else {
        resolve(rows)
        return rows
      }
    })
  })
}
