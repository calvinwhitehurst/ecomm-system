const axios = require('axios')

module.exports = getCount = storecred => {
  let count = storecred + 'products/count.json'
  return new Promise((resolve, reject) => {
    axios
      .get(count)
      .then(res => {
        resolve(res.data)
        count = data.count
      })
      .catch(err => {
        reject(console.log(err))
      })
    let pagecount = Math.ceil(count / 250)
    return pagecount
  })
}
