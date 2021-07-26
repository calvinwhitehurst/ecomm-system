const axios = require('axios')

module.exports = fetchJSON = url => {
  return new Promise((resolve, reject) => {
    axios
      .get(url)
      .then(res => {
        resolve(res.data)
      })
      .catch(err => {
        reject(console.log(err))
      })
  })
}
