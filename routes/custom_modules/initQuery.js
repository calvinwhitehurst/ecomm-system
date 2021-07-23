var request = require("request");

module.exports = function initQuery(store, storecred) {
  return new Promise((resolve, reject) => {
    request(store, (error, response) => {
      let link = response.headers.link;
      nextLink =
        storecred +
        "products.json" +
        link.substring(link.indexOf("?"), link.indexOf(">"));
      if (error) reject(error);
      else resolve(nextLink);
    });
  });
};
