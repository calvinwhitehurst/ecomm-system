module.exports = mustEmp = (req, res, next) => {
  if (req.user.roles === '1' || req.user.roles === '2') next()
  else res.redirect('/access')
}
