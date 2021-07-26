module.exports = daysAgo = days => {
  let d = new Date()
  let numDays = d.setDate(d.getDate() - days)
  numDays = new Date(numDays).toISOString()
  return numDays
}
