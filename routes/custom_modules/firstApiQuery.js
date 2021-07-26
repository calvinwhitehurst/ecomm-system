const axios = require("axios")

module.exports = firstApiQuery = async (store, storecred) => {
  let link
  let nextLink
  let urlArray = []
  console.log(store)
  console.log(storecred)
  await axios.get(store).then(res => {
    link = res.headers.link;
    nextLink =
      storecred +
      "products.json" +
      link.substring(link.indexOf("?"), link.indexOf(">"))
    urlArray.push(nextLink);
  })
  return urlArray
}
