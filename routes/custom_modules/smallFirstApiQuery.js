const axios = require("axios");

module.exports = function smallFirstApiQuery(store) {
  return new Promise((resolve, reject) => {
    axios.get(store).then(function (response, error) {
      var data = response.data.products;
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
};
