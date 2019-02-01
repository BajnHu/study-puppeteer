// const fs = require('fs')
// const { imagesDataPath} = require('../config/default');
// const {promisify} = require('util')
// const wirteFile = promisify(fs.writeFile)
// const readFile = promisify(fs.readFile)
// const mongoose = require('mongoose')
const JokeModel = require('../db/jokeSchema')


module.exports = async function (imgData, fn) {
    // 获取html 中的 图片url
    let newUrl = imgData.htmlStr.match(/src="(.+?)"/)[1]
    newUrl = newUrl.replace(/&amp;/g,'&')
    newUrl = newUrl.match(/http:\/\/(.+?)(.jpg|.png|.gif)/g);

    try {
        JokeModel.create({
            content: newUrl,
            title: imgData.title,
            id:imgData.id,
            type:'img',
            tags:imgData.tags
        },function (err,doc) {
            if(err){
                console.error(err)
            }else{
                imgData.lastDataInfo.index++;
                console.log(["INSERT SUCCESS"]+" ：" + doc.id);
            }
        })
    } catch (e) {
            console.log(e)
    }
    fn&&fn.constructor===Function&&fn();
}

