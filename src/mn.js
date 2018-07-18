const puppeteer = require('puppeteer')
const {mn} = require('./config/default');
const saveImg = require('./helper/saveImg')
;(async () => {
    const browser = await puppeteer.launch({
        // headless: false
    });
    const page = await browser.newPage();
    await page.goto('https://image.baidu.com/');

    console.log('go to baiduImage')
    await page.setViewport({
        width: 1920,
        height: 1000
    })
    console.log('reset viewport')

    await page.focus('#kw')
    await page.keyboard.sendCharacter('壁纸')
    await page.click('.s_search')

    console.log('go to search result list')

    await  page.on('load', async () => {
        console.log('page loading ')

        let srcs = await page.evaluate(() => {
            let images = document.querySelectorAll('img.main_img')
            return Array.prototype.map.call(images, img => img.src)
        })
        console.log(`get ${srcs.length} images, start download`)
        srcs.forEach(async (src) => {
            await page.waitFor(200)
            saveImg(src, mn)
        })

        // page.$$eval('.imgitem',(item)=>{
        //
        // })
        await browser.close();
    })

})();