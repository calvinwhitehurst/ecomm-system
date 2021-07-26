const connection = require('./connection.js')
const queries = require('./queries.js')

module.exports = submit = (data, storeid, warehouseid, storecred) => {
  let queryString = ''
  let queryString2 = ''
  let queryString3 = ''
  let queryString4 = ''
  let insertString = '(?,?,?,?),'
  let insertString2 = '(?,?,?,?,?,?,?,?,?),'
  let insertString3 = '(?,?,?,?),'
  let insertString4 = '(?,?,?),'
  let values = []
  let values2 = []
  let values3 = []
  let values4 = []
  for (let i = 0; i < data.length; i++) {
    values.push(
      data[i].id,
      data[i].variants[0].sku.split('-')[0],
      data[i].title,
      storeid
    )
    values3.push(
      data[i].id,
      data[i].variants[0].sku.split('-')[0],
      data[i].title,
      data[i].body_html
    )
    values4.push(data[i].variants[0].product_id, storecred, 0)
    queryString = queryString + insertString
    queryString3 = queryString3 + insertString3
    queryString4 = queryString4 + insertString4
    for (let j = 0; j < data[i].variants.length; j++) {
      values2.push(
        data[i].variants[j].id,
        data[i].variants[j].product_id,
        data[i].variants[j].inventory_item_id,
        data[i].variants[j].image_id,
        data[i].variants[j].title,
        data[i].variants[j].sku,
        data[i].variants[j].inventory_quantity,
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
    ' ON DUPLICATE KEY UPDATE inv = VALUES (inv)'
  let stmt3 = queries.productSync + queryString3
  let stmt4 = queries.photoQueueSync + queryString4
  connection.query(stmt, values)
  connection.query(stmt2, values2)
  connection.query(stmt3, values3)
  connection.query(stmt4, values4)
}
