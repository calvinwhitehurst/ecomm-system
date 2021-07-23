var request = require('request');

module.exports = function nextPageUrl(linkHeader){
    var linkArray = linkHeader.split(',');
    for(var i = linkArray.length - 1;i >= 0;i--){
        var linkFields = linkArray[i].split('>');
        if(linkFields[1].indexOf("next") > -1){
            var nextPageUrl = linkFields[0].trim();
            nextPageUrl = nextPageUrl.substring(1, nextPageUrl.length);
            return nextPageUrl;
        }
    }
}