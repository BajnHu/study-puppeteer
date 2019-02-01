const puppeteer = require('puppeteer');
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36';
const saveImage = require('./common/saveImage');
const saveVideo = require('./common/saveVideo');
const saveText = require('./common/saveText');

const JokeModel = require('./db/jokeSchema')
const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/jokeCang', {
    useNewUrlParser: true
}, function (err) {
    if (err) {
        console.log('error:' + err)
    } else {
        console.log('success')
    }
})

let lastDataInfo = {}

let saveData = async function (page) {
    console.log('elements loading')
    await page.waitFor('#mediaplayer')

    let title = await page.$eval('.browser-title', title => title.innerText);
    let vidoeIsHide = await page.$eval('.browser-video', ele => ele.style.display)
    let imageIsHide = await page.$eval('.browser-pic', ele => ele.style.display)
    let textIsHide = await page.$eval('.browser-text', ele => ele.style.display)

    let htmlStr = '';

    let currentId = page.url().match(/.com\/(\d+)\//)[1];

    if (!currentId) {
        nextPage(page)
        return
    }
    // 根据id查看数据里是否已经存在了当前数据
    JokeModel.findById(currentId, async (err, joke) => {
        if (err) {
            console.log(err)
            return;
        }
        // 数据库里有当前页中数据    直接下一页
        if (joke.length > 0) {
            console.log(`REPEAT :${currentId}`)
            nextPage(page)
        } else {
            // 当前页为 的joke 类型
            let jokeType = imageIsHide === 'block' ?
                'image' : vidoeIsHide === 'block' ?
                    'video' : textIsHide === 'block' ?
                        'text' : '';
            // joke 标签            
            let tags = await page.$$eval('.browser-bottom .bt-te .te', (eles) => {
                let texts = eles.map((item, idx) => {
                    return item.innerText
                })
                return texts
            })
            
            
            switch (jokeType) {
                case 'image': {
                    htmlStr = await page.$eval('.browser-pic', ele => ele.innerHTML);
                    saveImage({
                        htmlStr,
                        title,
                        id: currentId,
                        lastDataInfo,
                        tags
                    }, function () {
                        nextPage(page)
                    })
                    break;
                }
                case 'video': {
                    htmlStr = await page.$eval('#mediaplayer', ele => ele.innerHTML);
                    saveVideo({
                        title,
                        htmlStr,
                        id: currentId,
                        lastDataInfo,
                        tags
                    }, function () {
                        nextPage(page)
                    })
                    break;
                }
                case 'text': {
                    let content = await page.$eval('.browser-text ', ele => ele.innerHTML);
                    saveText({
                        title,
                        content,
                        id: currentId,
                        lastDataInfo,
                        tags
                    }, function () {
                        nextPage(page)
                    })
                    break;
                }

            }
            if (imageIsHide === 'block') {

            } else if (vidoeIsHide === 'block') {

            } else if (textIsHide === 'block') {

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
        headless: false
        // executablePath:chrome_exe
    });
    const page = await browser.newPage()
    await page.setUserAgent(userAgent)
    console.log('reset viewport')
    await page.setViewport({
        width: 1920,
        height: 1080
    })
    JokeModel.fetch(async (err, jokes) => {
        if (err) {
            console.log(err)
            return;
        }
        var id
        if (jokes.length === 0) {
            id = '4802089'
        } else {
            let lastData = jokes[jokes.length - 1]
            id = lastData.id
        }
        await page.goto(`http://haha.sogou.com/${id}/`)
        saveData(page)
    })
}