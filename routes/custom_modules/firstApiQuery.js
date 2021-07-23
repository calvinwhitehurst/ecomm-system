const axios = require("axios");

module.exports = async function firstApiQuery(store, storecred) {
  let link;
  let nextLink;
  let urlArray = [];
  console.log(store);
  console.log(storecred);
  await axios.get(store).then(function (res, error) {
    link = res.headers.link;
    nextLink =
      storecred +
      "products.json" +
      link.substring(link.indexOf("?"), link.indexOf(">"));
    urlArray.push(nextLink);
  });
  return urlArray;
};
