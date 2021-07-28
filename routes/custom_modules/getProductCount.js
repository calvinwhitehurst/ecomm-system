const axios = require('axios')

module.exports = getProductCount = url => {
  let boolean = true
  let pagecount = 0
  let data
  return new Promise((resolve, reject) => {
    axios.get(url).then((response, error) => {
      data = JSON.parse(response.data.count)
      if (data >= 250) {
        boolean = false
        pagecount = Math.ceil(data / 250)
      }
      if (error) reject(error)
      else resolve([boolean, pagecount])
    })
  })
}
