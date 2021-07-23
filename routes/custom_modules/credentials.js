var connection = require("./connection");
var Promise = require("promise");
var queries = require("./queries.js");

module.exports = function query() {
  return new Promise(function (resolve, reject) {
    connection.query(queries.stores, function (err, rows) {
      if (rows === undefined) {
        reject(new err("Error rows are undefined"));
      } else {
        resolve(rows);
        return rows;
      }
    });
  });
};
