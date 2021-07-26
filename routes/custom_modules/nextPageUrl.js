module.exports = nextPageUrl = linkHeader => {
  let linkArray = linkHeader.split(',')
  for (let i = linkArray.length - 1; i >= 0; i--) {
    let linkFields = linkArray[i].split('>')
    if (linkFields[1].indexOf('next') > -1) {
      let nextPageUrl = linkFields[0].trim()
      nextPageUrl = nextPageUrl.substring(1, nextPageUrl.length)
      return nextPageUrl
    }
  }
}
