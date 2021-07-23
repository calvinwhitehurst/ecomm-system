var express = require("express");
var router = express.Router();
var moment = require("moment");
var flash = require("connect-flash");
var unirest = require("unirest");
var mysqlTimestamp = moment(Date.now()).format("YYYY-MM-DD");
var tomorrow = moment(Date.now()).add(1, 'day').format("YYYY-MM-DD");
var today = moment(Date.now()).format("YYYY-MM-DD");
var connection = require("./custom_modules/connection");
var dbsync = require("./custom_modules/dbsync.js");
const axios = require("axios");
const cron = require("node-cron");
var isLoggedIn = require("./custom_modules/isLoggedIn.js");
var queries = require("./custom_modules/queries.js");
var onScan = require("onscan.js");
var sqlQuery = require("./custom_modules/sqlQuery.js");
var req = unirest("GET", "https://currency-exchange.p.rapidapi.com/exchange");
var salesSync = require("./custom_modules/salesSync.js");

// cron.schedule("0 46 * * * *", function (){
//   return new Promise(function (resolve, reject){
//     connection.query(
//       "SELECT id FROM stores;",
//       function (err, rows) {
//         for (var i =0; i < rows.length; i++) {
//           connection.query(
//             "INSERT IGNORE INTO `sales` (`store`, `sales_date`, `sales_total`) VALUES ('" + rows[i].id + "', '" + today + "', '0.00');");
//         }
//         if (err) {
//           //throw err;
//           console.log(err);
//           reject(err);
//         } else {
//           resolve();
//         }
//       }
//     )
//   });
// });

// cron.schedule("0 47 * * * *", function (){
//   return new Promise(function (resolve, reject){
//     req.query({
//       "to": "USD",
//       "from": "GBP",
//       "q": "1.0"
//     });
    
//     req.headers({
//       "x-rapidapi-key": "e058180246mshb5033e22c4d58acp1ce980jsn7c68b2c5166d",
//       "x-rapidapi-host": "currency-exchange.p.rapidapi.com",
//       "useQueryString": true
//     });

//     req.end(function (res) {
//       if (res.error) throw new Error(res.error);
//       console.log(res.body);
//       connection.query(
//         "INSERT INTO `currency_rate` (`rate`, `date`) VALUES (" + res.body + ",'" + today +"');", 
//         function(err){
//           if (err) {
//             //throw err;
//             console.log(err);
//             reject(err);
//           } else {
//             resolve();
//           }
//       })
//     })
//   })
// });

// cron.schedule("0 52 * * * *", function (){
//   return new Promise(function (resolve, reject){
//     connection.query(
//       "SELECT id FROM stores;",
//       function (err, rows) {
//         for (var i =0; i < rows.length; i++) {
//           connection.query(
//             "INSERT IGNORE INTO `sales` (`store`, `sales_date`, `sales_total`) VALUES ('" + rows[i].id + "', '2021-06-10', '0.00');");
//         }
//         if (err) {
//           //throw err;
//           console.log(err);
//           reject(err);
//         } else {
//           resolve();
//         }
//       }
//     )
//   });
// });







// cron.schedule("00 30 * * * *", function () {
//   return new Promise(function (resolve, reject) {
//     connection.query(
//       "SELECT api_key, pswrd, shop_url, id, warehouse FROM stores;",
//       function (err, rows) {
//         for (var i = 0; i < rows.length; i++) {
//           var cred =
//             "https://" +
//             rows[i].api_key +
//             ":" +
//             rows[i].pswrd +
//             "@" +
//             rows[i].shop_url +
//             "/admin/api/2019-10/";
//           var id = rows[i].id;
//           var warehouse = rows[i].warehouse;
//           //dbsync(cred, id, warehouse);
//         }
//         if (err) {
//           //throw err;
//           console.log(err);
//           reject(err);
//         } else {
//           resolve();
//         }
//       }
//     );
//   });
// });

router.get("/orderscanner", isLoggedIn, function(req, res) {
  connection.query(
    queries.stores + queries.userName,
    req.user.username,
    function (err, rows, fields) {
      res.render("orderscanner", {
        onScan: onScan,
        user: req.user,
        rows: rows[0],
        profile: rows[1][0],
      });
    }
  );
})

router.post("/inventory/(:id)", (req, res, next) => {
  console.log("inventory post");
  var location_id = req.params.id;
  let order = JSON.parse(JSON.stringify(req.body));
  for (let i = 0, p = Promise.resolve(); i < order.line_items.length; i++) {
    p = p.then(
      (_) =>
        new Promise((resolve) =>
          connection.query(
            "SET @p0='" +
              location_id +
              "'; SET @p1='" +
              order.line_items[i].quantity +
              "'; SET @p2='" +
              order.line_items[i].sku +
              "'; CALL `AllStoreIds`(@p0, @p1, @p2, @p3, @p4, @p5, @p6, @p7); SELECT @p3 AS `LocId`, @p4 AS `VarId`, @p5 AS `Api`, @p6 AS `Pswrd`, @p7 AS `Url`;",
            function (err, rows, fields) {
              console.log(
                order.line_items[i].quantity +
                  " " +
                  order.line_items[i].sku +
                  " logged."
              );
              if (typeof rows[4] !== "undefined" && null != rows[4][0].LocId) {
                axios
                  .post(
                    "https://" +
                      rows[4][0].Api +
                      ":" +
                      rows[4][0].Pswrd +
                      "@" +
                      rows[4][0].Url +
                      "/admin/api/2021-04/inventory_levels/adjust.json",
                    {
                      location_id: rows[4][0].LocId,
                      inventory_item_id: rows[4][0].VarId,
                      available_adjustment: -order.line_items[i].quantity,
                    }
                  )
                  .then(function () {
                    console.log("axios fired " + [i]);
                    resolve();
                  })
                  .catch(function (error) {
                    console.log(error);
                  });
              } else {
                console.log("axios did not fire " + [i]);
                resolve();
              }
            }
          )
        )
    );
  }
  res.sendStatus(200);
});

router.post("/inventorychange/(:id)", (req, res, next) => {
  // console.log("first");
  let data = JSON.parse(JSON.stringify(req.body));
  // console.log(data);
  // new Promise((resolve) =>
  connection.query("UPDATE store_var SET inv = " + parseInt(data.inv) + " WHERE var_id = '" + data.var_id + "';");
  // , function (err, rows, fields) {
  //   if (typeof rows !== "undefined") {
  //     axios
  //       .post(
  //         "https://" +
  //           rows.api_key +
  //           ":" +
  //           rows.pswrd +
  //           "@" +
  //           rows.shop_url +
  //           "/admin/api/2020-04/inventory_levels/set.json",
  //         {
  //           location_id: parseInt(data.storeid),
  //           inventory_item_id: parseInt(data.var_id),
  //           available: parseInt(data.inv),
  //         }
  //       )
  //       .then(function () {
  //         console.log("axios fired");
  //         resolve();
  //       })
  //       .catch(function (error) {
  //         console.log(error);
  //       });
  //   } else {
  //     console.log("axios did not fire");
  //     resolve();
  //   }
  // }))
  //)
  res.sendStatus(200);
});

router.post("/sales/(:id)", function (req, res) {
  let data = JSON.parse(JSON.stringify(req.body));
  sqlQuery(
    "SELECT * FROM stores WHERE id = " + req.params.id + ";SELECT rate FROM currency_rate WHERE date = '" + mysqlTimestamp + "';"
  )
    .then(function (rows) {
      console.log(rows[1][0].rate);
      if (data.currency === 'GBP'){
        data.subtotal_price = (Math.round((data.subtotal_price * rows[1][0].rate) * 100) / 100).toFixed(2);
        console.log(data.subtotal_price);
      }
    connection.query(
      "UPDATE `sales` SET `sales_total` = `sales_total` + " + data.subtotal_price + " WHERE `sales_date` = '" + mysqlTimestamp + "' AND `store` = " + req.params.id + ";INSERT INTO `orders` (`order_id`, `store`, `customer`, `scanned`, `fulfilled`, `date`) VALUES ('" + data.name + "', '" + req.params.id + "', '" + data.customer.default_address.name.toLowerCase() + "', FALSE, FALSE, '" + moment(Date.now()).format("MMMM Do YYYY, h:mm a") + "');" );
        for(var i = 0; i < data.line_items.length; i++){
          var title = data.line_items[i].title;
          connection.query(
            "INSERT INTO `order_items` (`sku`, `title`, `variant`, `qty`, `order_id`, `date`) VALUES ('" + data.line_items[i].sku + "', ? , '" + data.line_items[i].variant_title + "', " + data.line_items[i].quantity + ", '" + data.name + "', '" + mysqlTimestamp + "');", [title]
          );
        }
    res.sendStatus(200);
  })
});

router.post("/fulfillment/(:id)", function (req, res) {
  let data = JSON.parse(JSON.stringify(req.body));
    connection.query(
      "UPDATE `orders` SET `fulfilled` = TRUE WHERE `order_id` = '" + data.name + "';" );
    res.sendStatus(200);
  });

router.get("/scan/(:id)", function (req, res) {
  let data = req.params.id;
  connection.query(
    "SELECT * FROM `order_items` WHERE `order_id` = ?;", data, function(err, rows, fields){
      if (err) throw err;
      let data = [];  
      for (i = 0; i < rows.length; i++) {
        var object = {
          title: rows[i].title,
          variant: rows[i].variant,
          order: rows[i].order_id,
          sku: rows[i].sku,
          quantity: rows[i].qty
        };
        data.push(object);
      }
    res.end(JSON.stringify(data));
  });
});

router.post("/cancellation/(:id)", function (req, res) {
  let data = JSON.parse(JSON.stringify(req.body));
    connection.query(
      "UPDATE `sales` SET `sales_total` = `sales_total` - " + data.subtotal_price + " WHERE `sales_date` = '" + moment(data.created_at).format('YYYY-MM-DD') + "' AND `store` = " + req.params.id + ";" );
    res.sendStatus(200);
  });

router.post("/refund/(:id)", function (req, res) {
  let data = JSON.parse(JSON.stringify(req.body));
    for(var i = 0; i < data.transactions.length; i++){
    connection.query(
      "UPDATE `sales` SET `sales_total` = `sales_total` - " + data.transactions[i].amount + " WHERE `sales_date` = '" + moment(data.transactions[i].created_at).format('YYYY-MM-DD') + "' AND `store` = " + req.params.id + ";" );
    }
    res.sendStatus(200);
  });
// router.post("/cancellation/(:id)", (req, res, next) => {
//   console.log("cancellation post");
//   var location_id = req.params.id;
//   let order = JSON.parse(JSON.stringify(req.body));
//   for (let i = 0, p = Promise.resolve(); i < order.line_items.length; i++) {
//     p = p.then(
//       (_) =>
//         new Promise((resolve) =>
//           connection.query(
//             "SET @p0='" +
//               location_id +
//               "'; SET @p1='" +
//               order.line_items[i].quantity +
//               "'; SET @p2='" +
//               order.line_items[i].sku +
//               "'; CALL `AllStoreIdsCancel`(@p0, @p1, @p2, @p3, @p4, @p5, @p6, @p7); SELECT @p3 AS `LocId`, @p4 AS `VarId`, @p5 AS `Api`, @p6 AS `Pswrd`, @p7 AS `Url`;",
//             function (err, rows, fields) {
//               console.log(
//                 order.line_items[i].quantity +
//                   " " +
//                   order.line_items[i].sku +
//                   " logged."
//               );
//               if (typeof rows[4] !== "undefined" && null != rows[4][0].LocId) {
//                 axios
//                   .post(
//                     "https://" +
//                       rows[4][0].Api +
//                       ":" +
//                       rows[4][0].Pswrd +
//                       "@" +
//                       rows[4][0].Url +
//                       "/admin/api/2020-04/inventory_levels/adjust.json",
//                     {
//                       location_id: rows[4][0].LocId,
//                       inventory_item_id: rows[4][0].VarId,
//                       available_adjustment: order.line_items[i].quantity,
//                     }
//                   )
//                   .then(function () {
//                     console.log("axios fired " + [i]);
//                     resolve();
//                   })
//                   .catch(function (error) {
//                     console.log(error);
//                   });
//               } else {
//                 console.log("axios did not fire " + [i]);
//                 resolve();
//               }
//             }
//           )
//         )
//     );
//   }
//   res.sendStatus(200);
// });

module.exports = router;
