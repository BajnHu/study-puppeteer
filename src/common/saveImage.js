const fs = require('fs')
const { imagesDataPath} = require('../config/default');
const {promisify} = require('util')
const wirteFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)

module.exports = async function (imgData, fn) {
    let newUrl = imgData.htmlStr.match(/src="(.+?)"/)[1]
    try {
        var oldData = await readFile(imagesDataPath)

        oldData = JSON.parse(oldData.toString())
        if (!oldData.data) {
            oldData = {"data": []}
        }
        oldData.data.push({
            url: newUrl,
            title: imgData.title
        })
        let dataStr = JSON.stringify(oldData)
        await wirteFile(imagesDataPath, dataStr)
    } catch (e) {
        if (e) {
            console.log(e)
        }
    }
    if (fn) {
        fn()
    }
}