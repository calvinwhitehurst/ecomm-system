const connection = require('./connection.js')
const queries = require('./queries.js')
const firstApiQuery = require('./firstApiQuery.js')
const loopApiQuery = require('./loopApiQuery.js')
const smallFirstApiQuery = require('./smallFirstApiQuery.js')
const syncInsert = require('./syncInsert.js')
const getProductCount = require('./getProductCount.js')
const submit = require('./submit.js')

module.exports = dbsync = (storecred, storeid, warehouseid) => {
  connection.query(
    queries.storeProdCreate + queries.storeVarCreate + queries.photoQueueCreate
  )
  let store =
    storecred + 'products.json?fields=id,title,body_html,variants&limit=250'
  let count = storecred + 'products/count.json'
  getProductCount(count)
    .then(result => {
      if (result[0] === true) {
        smallFirstApiQuery(store)
          .then(data => {
            submit(data, storeid, warehouseid, storecred)
          })
          // .then(() => {
          //   downloadQueue();
          // })
          .catch(error => {
            console.log(error + ' the sync failed1')
          })
      } else {
        firstApiQuery(store, storecred)
          .then(urlArray => {
            return loopApiQuery(urlArray, storecred, result[1])
          })
          .then(urlArray => {
            return syncInsert(
              urlArray,
              result[1],
              storeid,
              warehouseid,
              storecred
            )
          })
          // .then(() => {
          //   downloadQueue();
          // })
          .catch(error => {
            console.log(error + ' the sync failed')
          })
      }
    })
    .catch(error => {
      console.log(error + ' It failed')
    })
}
