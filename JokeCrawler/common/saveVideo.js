// const fs = require('fs')
// const {promisify} = require('util')
// const wirteFile = promisify(fs.writeFile)
// const readFile = promisify(fs.readFile)
// const {videosDataPath } = require('../config/default');
const JokeModel = require('../db/jokeSchema')

module.exports = async (videoData ,fn)=>{
    if(/<video/.test(videoData.htmlStr)){
        videoData.url  = H5ToUrl(videoData.htmlStr).replace(/&amp;/g,'&')
    }else if(/<object/.test(videoData.htmlStr)){
        videoData.url = flashToUrl(videoData.htmlStr).replace(/&amp;/g,'&')
        delete videoData.htmlStr
    }else {
        return
    }
    try {
        JokeModel.create({
            title:videoData.title,
            content:videoData.url,
            id:videoData.id,
            type:'video',
            tags:videoData.tags
        },function (err,doc) {
            if(err){
                console.error(err)
            }else{
                console.log(["INSERT SUCCESS"]+" ：" + doc.id);
            }
        })
    }catch (e){
            console.log(e)
    }
    fn&&fn.constructor===Function&&fn();
}

const flashToUrl = HtmlStr => {
    let embedStr = HtmlStr.match(/<embed(.+)>/)[1]
    let videoUrl = embedStr.match(/flashvars=("|')f=(.+?)&/)[2];
    return videoUrl
}
const H5ToUrl = HtmlStr => {
    let videoUrl =  HtmlStr.match(/src="(.+?)"/)[1];
    return videoUrl;
}