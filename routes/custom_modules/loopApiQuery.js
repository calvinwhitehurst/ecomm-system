const axios = require("axios")

module.exports = loopApiQuery = async (urlArray, storecred, pages) => {
  let nextLink
  for (let i = 0; i < pages - 1; i++) {
    await axios.get(urlArray[i]).then(res => {
      nextLink = res.headers.link
      if (nextLink.includes('rel="next"') == true) {
        nextLink =
          storecred +
          "products.json" +
          nextLink.substring(
            nextLink.lastIndexOf("?"),
            nextLink.lastIndexOf(">")
          );
        urlArray.push(nextLink);
      } else {
        nextLink =
          storecred +
          "products.json" +
          nextLink.substring(nextLink.indexOf("?"), nextLink.indexOf(">"))
        urlArray.push(nextLink)
      }
    })
  }
  return urlArray
}
