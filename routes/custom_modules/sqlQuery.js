var connection = require("./connection.js");
var Promise = require('bluebird');
module.exports = function sqlQuery(sql, params) {
    return new Promise(function(resolve, reject){
        connection.query(sql, params, function(err, rows, fields){ 
            if (err) {
                //throw err;
                logger.info(err);
                reject(err);
            }
            else {
                resolve(rows);
            }
        });
    });
}

