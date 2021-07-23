const axios = require("axios");

module.exports = async function loopApiQuery(urlArray, storecred, pages) {
  console.log(pages);
  let nextLink;
  for (let i = 0; i < pages - 1; i++) {
    await axios.get(urlArray[i]).then(function (res) {
      nextLink = res.headers.link;
      if (nextLink.includes('rel="next"') == true) {
        nextLink =
          storecred +
          "products.json" +
          nextLink.substring(
            nextLink.lastIndexOf("?"),
            nextLink.lastIndexOf(">")
          );
        urlArray.push(nextLink);
        console.log(urlArray + " :" + [i] + " 1");
      } else {
        nextLink =
          storecred +
          "products.json" +
          nextLink.substring(nextLink.indexOf("?"), nextLink.indexOf(">"));
        urlArray.push(nextLink);
        console.log(urlArray + " :" + [i] + " 2");
      }
    });
  }
  return urlArray;
};
