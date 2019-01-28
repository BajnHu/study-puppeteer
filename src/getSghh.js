const puppeteer = require('puppeteer')
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36';
const saveImage = require('./common/saveImage')
const saveVideo = require('./common/saveVideo')
const saveText = require('./common/saveText');

const JokeModel = require('./db/jokeSchema')

// const {totalPageNum} = require('./config/default')


const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/jokeCang',{
  useNewUrlParser:true
},function(err){
  if(err){
    console.log('error:'+err)
  }else{
    console.log('success')
  }
})

let lastDataInfo = {
    index:0
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
                    id:currentId,
                    lastDataInfo
                },function () {
                    nextPage(page)
                })
            } else if (vidoeIsHide === 'block') {
                htmlStr = await page.$eval('#mediaplayer', ele => ele.innerHTML);
                saveVideo({
                    title,
                    htmlStr,
                    id:currentId,
                    lastDataInfo
                },function () {
                    nextPage(page)
                })
            } else if (textIsHide === 'block') {
                let content = await page.$eval('.browser-text ', ele => ele.innerHTML);
                saveText({
                    title,
                    content,
                    id:currentId,
                    lastDataInfo
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

module.exports = async () => {
    const browser = await puppeteer.launch({
        // headless: false
        // executablePath:chrome_exe
    });
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
            return ;
        }
        var id
        if(jokes.length===0){
            lastDataInfo.index = 0
            id = '4802089'
        }else{
            let lastData = jokes[jokes.length-1]
            lastDataInfo.index  = lastData.index+1
            id = lastData.id
        }
        await page.goto(`http://haha.sogou.com/${id}/`)
        saveData(page)
    })
}