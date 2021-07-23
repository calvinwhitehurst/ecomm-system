module.exports = function daysAgo(days) {
  var d = new Date();
  var numDays = d.setDate(d.getDate() - days);
  numDays = new Date(numDays).toISOString();
  return numDays;
};
