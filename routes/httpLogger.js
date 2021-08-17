const morgan = require('morgan')
const logger = require('./logger')

skipLog = req => {
  let url = req.url
  if (url.indexOf('?') > 0) url = url.substr(0, url.indexOf('?'))
  if (url.match(/(js|jpg|png|ico|css|woff|woff2|eot|gif)$/gi)) {
    return true
  }
  return false
}

morgan.token('date', function () {
  var p = new Date()
    .toString()
    .replace(/[A-Z]{3}\+/, '+')
    .split(/ /)
  return p[2] + '/' + p[1] + '/' + p[3] + ':' + p[4] + ' ' + p[5]
})

morgan.token('error', (req) => {
  if (req.err) {
    return req.err.message
  }
  return 'no errors'
})

morgan.token(
  'ip',
  req => req.headers['x-real-ip'] || req.connection.remoteAddress
)

morgan.token('user', req => {
  if (req.user) {
    return req.user.username
  }
  return 'no user info'
})

logger.stream = {
  write: message => logger.info(message.substring(0, message.lastIndexOf('\n')))
}

module.exports = morgan(':date :method :url :status :ip :user :error', {
  stream: logger.stream,
  skip: skipLog
})
