module.exports = mustAdmin = (req, res, next) => {
  if (req.user.roles === '2') next()
  else res.redirect('/access')
}
