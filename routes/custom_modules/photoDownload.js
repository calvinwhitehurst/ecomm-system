const download = require('image-downloader')

module.exports = photoDownload = url => {
  let options = {
    url: url,
    dest: 'public/img'
  }
  console.log(__dirname + '/img/')
  download
    .image(options)
    .then(({ filename }) => {
      console.log('Saved to', filename)
    })
    .catch(err => console.error(err))
}
