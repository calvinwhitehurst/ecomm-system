const axios = require("axios")
const connection = require("./connection.js")
const queries = require("./queries.js")

module.exports = syncInsert = async (
  result,
  count,
  storeid,
  warehouseid,
  storecred
) => {
  for (let h = 0; h <= count - 1; h++) {
    await axios.get(result[h]).then(response => {
      let queryString = ""
      let queryString2 = ""
      let queryString3 = ""
      let queryString4 = ""
      let insertString = "(?,?,?,?),"
      let insertString2 = "(?,?,?,?,?,?,?,?,?),"
      let insertString3 = "(?,?,?,?),"
      let insertString4 = "(?,?,?),"
      let values = []
      let values2 = []
      let values3 = []
      let values4 = []
      for (let i = 0; i < response.data.products.length; i++) {
        values.push(
          response.data.products[i].id,
          response.data.products[i].variants[0].sku.split("-")[0],
          response.data.products[i].title,
          storeid
        )
        values3.push(
          response.data.products[i].id,
          response.data.products[i].variants[0].sku.split("-")[0],
          response.data.products[i].title,
          response.data.products[i].body_html
        )
        values4.push(
          response.data.products[i].variants[0].product_id,
          storecred,
          0
        )
        queryString = queryString + insertString
        queryString3 = queryString3 + insertString3
        queryString4 = queryString4 + insertString4
        for (let j = 0; j < response.data.products[i].variants.length; j++) {
          values2.push(
            response.data.products[i].variants[j].id,
            response.data.products[i].variants[j].product_id,
            response.data.products[i].variants[j].inventory_item_id,
            response.data.products[i].variants[j].image_id,
            response.data.products[i].variants[j].title,
            response.data.products[i].variants[j].sku,
            response.data.products[i].variants[j].inventory_quantity,
            storeid,
            warehouseid
          )
          queryString2 = queryString2 + insertString2
        }
      }
      queryString = queryString.substring(0, queryString.length - 1)
      queryString2 = queryString2.substring(0, queryString2.length - 1)
      queryString3 = queryString3.substring(0, queryString3.length - 1)
      queryString4 = queryString4.substring(0, queryString4.length - 1)
      let stmt = queries.storeProdSync + queryString
      let stmt2 =
        queries.storeVarSync +
        queryString2 +
        " ON DUPLICATE KEY UPDATE inv = VALUES (inv)"
      let stmt3 = queries.productSync + queryString3
      let stmt4 = queries.photoQueueSync + queryString4
      connection.query(stmt, values)
      connection.query(stmt2, values2)
      connection.query(stmt3, values3)
      connection.query(stmt4, values4)
    })
  }
  console.log("done syncing " + storeid)
}
