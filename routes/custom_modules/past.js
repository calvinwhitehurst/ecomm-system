module.exports = function past(){

var dateObj = new Date();
var month = dateObj.getUTCMonth() + 1; //months from 1-12
var day = dateObj.getUTCDate();
var year = dateObj.getUTCFullYear();
var today =  year + "-" + month + "-" + day;
var past = new Date(today);
var daysPrior = 10;
return past.setDate(past.getDate() - daysPrior);
}