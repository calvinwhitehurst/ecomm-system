module.exports = skipLog = req => {
  let url = req.url
  if (url.indexOf('?') > 0) url = url.substr(0, url.indexOf('?'))
  if (url.match(/(js|jpg|png|ico|css|woff|woff2|eot)$/gi)) {
    return true
  }
  return false
}
