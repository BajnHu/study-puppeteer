const fs = require('fs')
const { textsDataPath} = require('../config/default');
const {promisify} = require('util')
const wirteFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)

module.exports = async function (textData, fn) {

    try {
        var oldData = await readFile(textsDataPath)
        oldData = JSON.parse(oldData.toString())
        if (!oldData.data) {
            oldData = {"data": []}
        }
        oldData.data.push(textData)
        let dataStr = JSON.stringify(oldData)
        await wirteFile(textsDataPath, dataStr)
    } catch (e) {
        if (e) {
            console.log(e)
        }
    }
    if (fn) {
        fn()
    }
}