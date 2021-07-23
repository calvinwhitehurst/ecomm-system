var connection = require("./connection.js");
var queries = require("./queries.js");
module.exports = function submit(data, storeid, warehouseid, storecred) {
  var queryString = "";
  var queryString2 = "";
  var queryString3 = "";
  var queryString4 = "";
  var insertString = "(?,?,?,?),";
  var insertString2 = "(?,?,?,?,?,?,?,?,?),";
  var insertString3 = "(?,?,?,?),";
  var insertString4 = "(?,?,?),";
  var values = [];
  var values2 = [];
  var values3 = [];
  var values4 = [];
  for (var i = 0; i < data.length; i++) {
    values.push(
      data[i].id,
      data[i].variants[0].sku.split("-")[0],
      data[i].title,
      storeid
    );
    values3.push(
      data[i].id,
      data[i].variants[0].sku.split("-")[0],
      data[i].title,
      data[i].body_html
    );
    values4.push(data[i].variants[0].product_id, storecred, 0);
    queryString = queryString + insertString;
    queryString3 = queryString3 + insertString3;
    queryString4 = queryString4 + insertString4;
    for (var j = 0; j < data[i].variants.length; j++) {
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
      );
      queryString2 = queryString2 + insertString2;
    }
  }

  queryString = queryString.substring(0, queryString.length - 1);
  queryString2 = queryString2.substring(0, queryString2.length - 1);
  queryString3 = queryString3.substring(0, queryString3.length - 1);
  queryString4 = queryString4.substring(0, queryString4.length - 1);
  var stmt = queries.storeProdSync + queryString;
  var stmt2 =
    queries.storeVarSync +
    queryString2 +
    " ON DUPLICATE KEY UPDATE inv = VALUES (inv)";
  var stmt3 = queries.productSync + queryString3;
  var stmt4 = queries.photoQueueSync + queryString4;
  connection.query(stmt, values);
  connection.query(stmt2, values2);
  connection.query(stmt3, values3);
  connection.query(stmt4, values4);
};
