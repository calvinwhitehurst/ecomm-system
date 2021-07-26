module.exports = mustAdmin = (req, res, next) => {
  if (req.user.roles === '2') {
    return next()
  } else {
    res.redirect('/access')
  }
}
