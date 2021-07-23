
module.exports = function mustEmp(req, res, next) {
    if (req.user.roles === '1' || req.user.roles === '2'){
            return next();
    }else{
            res.redirect('/access');
            }	
    };