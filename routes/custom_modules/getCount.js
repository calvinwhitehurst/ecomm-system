var axios = require('axios');

module.exports = function getCount(storecred){
    var count = storecred + 'products/count.json';
    return new Promise(function(resolve, reject) {
      axios.get(count)
        .then(function(res) {
          resolve(res.data);
          count = data.count;
        })
        .catch(function (err){
          reject(console.log(err));
        })
      var pagecount = Math.ceil(count / 250);
      return pagecount;
    });
}