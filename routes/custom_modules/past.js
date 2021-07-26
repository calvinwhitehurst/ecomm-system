module.exports = past = () => {
  let dateObj = new Date()
  let month = dateObj.getUTCMonth() + 1
  let day = dateObj.getUTCDate()
  let year = dateObj.getUTCFullYear()
  let today = year + '-' + month + '-' + day
  let past = new Date(today)
  let daysPrior = 10
  return past.setDate(past.getDate() - daysPrior)
}
