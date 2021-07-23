var connection = require("./connection.js");
var downloadQueue = require("./downloadQueue.js");
var queries = require("./queries.js");
var firstApiQuery = require("./firstApiQuery.js");
var loopApiQuery = require("./loopApiQuery.js");
var smallFirstApiQuery = require("./smallFirstApiQuery.js");
var syncInsert = require("./syncInsert.js");
var getProductCount = require("./getProductCount.js");
var submit = require("./submit.js");

module.exports = function dbsync(storecred, storeid, warehouseid) {
  connection.query(
    queries.storeProdCreate + queries.storeVarCreate + queries.photoQueueCreate
  );
  var store =
    storecred + "products.json?fields=id,title,body_html,variants&limit=250";
  var count = storecred + "products/count.json";
  getProductCount(count)
    .then(function (result) {
      console.log(result);
      if (result[0] === true) {
        smallFirstApiQuery(store)
          .then(function (data) {
            submit(data, storeid, warehouseid, storecred);
          })
          // .then(function () {
          //   downloadQueue();
          // })
          .catch(function (error) {
            console.log(error + " the sync failed1");
          });
      } else {
        firstApiQuery(store, storecred)
          .then(function (urlArray) {
            console.log(urlArray);
            return loopApiQuery(urlArray, storecred, result[1]);
          })
          .then(function (urlArray) {
            console.log(urlArray);
            return syncInsert(
              urlArray,
              result[1],
              storeid,
              warehouseid,
              storecred
            );
          })
          // .then(function () {
          //   downloadQueue();
          // })
          .catch(function (error) {
            console.log(error + " the sync failed");
          });
      }
    })
    .catch(function (error) {
      console.log(error + " It failed");
    });
};
