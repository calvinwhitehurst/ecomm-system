var axios = require('axios');

module.exports = function fetchJSON(url) {
	return new Promise(function(resolve, reject) {
	  axios.get(url)
	  .then(function(res) {
		  resolve(res.data);
	  })
	  .catch(function (err){
		  reject(console.log(err));
	  })
	});
  }