// const fs = require('fs')
// const { imagesDataPath} = require('../config/default');
// const {promisify} = require('util')
// const wirteFile = promisify(fs.writeFile)
// const readFile = promisify(fs.readFile)
// const mongoose = require('mongoose')
const JokeModel = require('../db/jokeSchema')


module.exports = async function (imgData, fn) {
    let newUrl = imgData.htmlStr.match(/src="(.+?)"/)[1]
    newUrl = newUrl.replace(/&amp;/g,'&')
    newUrl = newUrl.match(/http:\/\/(.+?)(.jpg|.png|.gif)/g)
    try {
        JokeModel.create({
            content: newUrl,
            title: imgData.title,
            id:imgData.id,
            type:'img',
            index:imgData.lastDataInfo.index
        },function (err,doc) {
            if(err){
                console.error(err)
            }else{
                imgData.lastDataInfo.index++;
                console.log(["INSERT SUCCESS"]+" ：" + doc.id);
            }
        })
    } catch (e) {
        if (e) {
            console.log(e)
        }
    }
    if (fn) {
        fn()
    }
}

// module.exports = async function (imgData, fn) {
//     let newUrl = imgData.htmlStr.match(/src="(.+?)"/)[1]
//     newUrl = newUrl.replace(/&amp;/g,'&')
//     try {
//         var oldData = await readFile(imagesDataPath)
//
//         oldData = JSON.parse(oldData.toString())
//         if (!oldData.data) {
//             oldData = {"data": []}
//         }
//         oldData.data.push({
//             url: newUrl,
//             title: imgData.title
//         })
//         let dataStr = JSON.stringify(oldData)
//         await wirteFile(imagesDataPath, dataStr)
//     } catch (e) {
//         if (e) {
//             console.log(e)
//         }
//     }
//     if (fn) {
//         fn()
//     }
// }

