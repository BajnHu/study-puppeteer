const puppeteer = require('puppeteer')
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36';
const saveImage = require('./common/saveImage')
const saveVideo = require('./common/saveVideo')
const saveText = require('./common/saveText');
const JokeModel = require('./db/jokeSchema')
const mongoose = require('mongoose')
// 连接失败
mongoose.connection.on("error", function(err){
    console.error("数据库链接失败:"+ err);
});
// 连接成功
mongoose.connection.on("open", function(){
    console.log("数据库链接成功");
});
// 断开数据库
mongoose.connection.on("disconnected", function() {
    console.log("数据库断开");
})

module.exports = async () => {
    const browser = await puppeteer.launch({
        headless: false
        // executablePath:chrome_exe
    })
    const page = await browser.newPage()
    await page.setUserAgent(userAgent)
    console.log('reset viewport')
    await page.setViewport({
        width: 1920,
        height: 1080
    })

    JokeModel.fetch(async (err,jokes)=>{
        if(err){
            console.log(err)
        }
        var id = jokes[jokes.length-1].id
        console.log("start Data: " + jokes[jokes.length-1])
        await page.goto(`http://haha.sogou.com/${id}/`)
        saveData(page)
    })
}
let saveData = async function (page) {
    console.log('elements loading')
    await page.waitFor('#mediaplayer')

    let title = await page.$eval('.browser-title', title => title.innerText);
    let vidoeIsHide = await page.$eval('.browser-video', ele => ele.style.display)
    let imageIsHide = await page.$eval('.browser-pic', ele => ele.style.display)
    let textIsHide = await page.$eval('.browser-text', ele => ele.style.display)

    let htmlStr = '';

    let currentId = page.url().match(/.com\/(\d+)\//)[1];

    if(!currentId){
        nextPage(page)
        return
    }

    JokeModel.findById(currentId,async (err,joke)=>{
        if(err){
            console.log(err)
            return
        }
        if(joke.length>0){
            console.log(`REPEAT :${currentId}`)
            nextPage(page)
        }else{
            if (imageIsHide === 'block') {
                htmlStr = await page.$eval('.browser-pic', ele => ele.innerHTML);
                saveImage({
                    htmlStr,
                    title,
                    id:currentId
                },function () {
                    nextPage(page)
                })
            } else if (vidoeIsHide === 'block') {
                htmlStr = await page.$eval('#mediaplayer', ele => ele.innerHTML);
                saveVideo({
                    title,
                    htmlStr,
                    id:currentId
                },function () {
                    nextPage(page)
                })
            } else if (textIsHide === 'block') {
                let content = await page.$eval('.browser-text ', ele => ele.innerHTML);
                saveText({
                    title,
                    content,
                    id:currentId
                },function () {
                    nextPage(page)
                })
            }
        }
    })
    // await browser.close();
}
let nextPage = async function (page) {
    await page.keyboard.press('ArrowRight');
    await page.waitFor(3000)
    saveData(page);
}