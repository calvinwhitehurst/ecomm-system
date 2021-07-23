var connection = require("./connection.js");
var photoDownload = require("./photoDownload.js");
const axios = require("axios");

module.exports = function downloadQueue() {
  return new Promise(function (resolve, reject) {
    connection.query(
      "SELECT `prod_id`, `storecred` FROM `photo_download_queue` WHERE `downloaded` = 0;",
      function (err, rows) {
        for (let i = 0; i < rows.length; i++) {
          setTimeout(function () {
            axios
              .get(
                rows[i].storecred +
                  "products/" +
                  rows[i].prod_id +
                  "/images.json",
                { responseType: "json" }
              )
              .then(function (res) {
                if(res.data.images.length > 0){
                connection.query(
                  "UPDATE `photo_download_queue` SET `downloaded` = 1 WHERE `prod_id` = " +
                    rows[i].prod_id
                );
                for (var j = 0; j < res.data.images.length; j++) {
                  photoDownload(res.data.images[j].src, res.data.images[j].id);
                  connection.query(
                    "INSERT IGNORE INTO `product_image` (`pim_id`, `pim_prd_id`) VALUES (" +
                      res.data.images[j].id +
                      ", " +
                      res.data.images[j].product_id +
                      ");"
                  );
                }
              }
              })
              .catch(function (error) {
                connection.query(
                  "UPDATE `photo_download_queue` SET `downloaded` = 1 WHERE `prod_id` = " +
                    rows[i].prod_id
                );
              })
          }, i * 1000);
        }
        if (err) {
          reject();
        } else {
          resolve();
        }
      }
    );
  });
};
