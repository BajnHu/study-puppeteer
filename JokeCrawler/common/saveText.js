// const fs = require('fs')
// const { textsDataPath} = require('../config/default');
// const {promisify} = require('util')
// const wirteFile = promisify(fs.writeFile)
// const readFile = promisify(fs.readFile)
const JokeModel = require('../db/jokeSchema')


module.exports = async function (textData, fn) {
    try {
       JokeModel.create({
           title:textData.title,
           content:textData.content,
           type:'text',
           id:textData.id,
           tags:textData.tags
       },function (err,doc) {
           if(err){
               console.error(err)
           }else{
               console.log(["INSERT SUCCESS"]+" ：" + doc.id);
           }
       })
    } catch (e) {
        console.log(e)
    }
    fn&&fn.constructor===Function&&fn();
}
