const axios = require('axios')

module.exports = smallFirstApiQuery = store => {
  return new Promise((resolve, reject) => {
    axios.get(store).then((response, error) => {
      let data = response.data.products
      if (error) {
        reject(error)
      } else {
        resolve(data)
      }
    })
  })
}
