const download = require("image-downloader");

module.exports = function photoDownload(url, fileNumber) {
  var options = {
    url: url,
    dest: "public/img",
  };
  console.log(__dirname + "/img/");
  download
    .image(options)
    .then(({ filename }) => {
      console.log("Saved to", filename); // saved to /path/to/dest/photo.jpg
    })
    .catch((err) => console.error(err));
};
