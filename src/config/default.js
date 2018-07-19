const path = require('path')

module.exports = {
    screenshot: path.resolve(__dirname, '../../screenshot'),
    mn: path.resolve(__dirname, '../../mn'),
    videosDataPath: path.resolve(__dirname, '../../json/videos.json'),
    imagesDataPath: path.resolve(__dirname, '../../json/images.json'),
    textsDataPath: path.resolve(__dirname, '../../json/texts.json'),
    totalPageNum: 50
}