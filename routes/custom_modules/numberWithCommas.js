module.exports = numberWithCommas = x => {
  const fixedNumber = Number.parseFloat(x).toFixed(2)
  return String(fixedNumber).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
