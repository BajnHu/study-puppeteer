const puppeteer = require('puppeteer')
const {mn} = require('./config/default');
const saveImg = require('./helper/saveImg')
;(async () => {
    const browser = await puppeteer.launch({
        // headless: false
    });
    const page = await browser.newPage();
    await page.goto('http://haha.sogou.com/4937239/');

    console.log('go to baiduImage')
    await page.setViewport({
        width: 1920,
        height: 1000
    })
    console.log('reset viewport')

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