module.exports = today = () => {
  let dateObj = new Date()
  let month = dateObj.getUTCMonth() + 1
  let day = dateObj.getUTCDate()
  let year = dateObj.getUTCFullYear()
  let today = year + '-' + month + '-' + day
  return today
}
