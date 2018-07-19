const puppeteer = require('puppeteer')
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36';
const saveImage = require('./common/saveImage')
const saveVideo = require('./common/saveVideo')
const saveText = require('./common/saveText');
const {totalPageNum} = require('./config/default')

;(async () => {
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
    await page.goto('http://haha.sogou.com/4493299/')
    saveData(page)

})();

let saveData = async function (page) {
    console.log('elements loading')
    await page.waitFor('#mediaplayer')

    let title = await page.$eval('.browser-title', title => title.innerText);
    let vidoeIsHide = await page.$eval('.browser-video', ele => ele.style.display)
    let imageIsHide = await page.$eval('.browser-pic', ele => ele.style.display)
    let textIsHide = await page.$eval('.browser-text', ele => ele.style.display)

    let htmlStr = '';
    if (imageIsHide === 'block') {
        htmlStr = await page.$eval('.browser-pic', ele => ele.innerHTML);
        saveImage({
            htmlStr,
            title
        },function () {
            nextPage(page)
        })
    } else if (vidoeIsHide === 'block') {
        htmlStr = await page.$eval('#mediaplayer', ele => ele.innerHTML);
        saveVideo({
            title,
            htmlStr
        },function () {
            nextPage(page)
        })
    } else if (textIsHide === 'block') {
        let content = await page.$eval('.browser-text ', ele => ele.innerHTML);
        console.log(content)
        saveText({
            title,
            content
        },function () {
            nextPage(page)
        })
    }
    // await browser.close();
}


let nextPage = async function (page) {
    await page.keyboard.press('ArrowRight');
    await page.waitFor(3000)
    saveData(page);
}