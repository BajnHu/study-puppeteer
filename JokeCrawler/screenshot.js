const puppeteer = require('puppeteer')
const conf = require('./config/default');

(async () => {
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();
    await page.goto('http://haha.sogou.com/');

    console.log('go to baiduImage')
    // await page.screenshot({
    //     path: `${conf.screenshot}/${Date.now()}.png`,
    //     fullPage: true
    // });
    await browser.close();


})();

