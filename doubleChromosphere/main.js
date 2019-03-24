const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const {promisify} = require('util')
const readFile = promisify(fs.readFile)
const mkdir = promisify(fs.mkdir)

const versionFile = path.resolve('./version.json');

const createNumbers = require('./createNumber');

(async () => {

  // 杀号数据来源
  let urls = require('./website.json');

  // 存放 杀号数据
  let ballData = {};

  // 已经爬去的页面数量
  let pageIdx = 0;


  // 打开浏览器
  const borow = await (puppeteer.launch({
    executablePath: path.resolve('../node_modules/puppeteer/.local-chromium/win64-637110/chrome-win/chrome.exe'),
    // headless: false
  }));

  // 双色球 版本号(期号) 处理
  const getVersion = async () => {
    let oldVersion;
    let domId = '#currentPeriod';
    // 判断本地是否已经有了 版本号
    try {
      let json = await readFile(versionFile, 'utf-8');
      oldVersion = JSON.parse(json).version;
    } catch (err) {
      console.log(err)
      oldVersion = false;
    }

    const page = await borow.newPage();

    const netEase = urls.filter((item) => {
      return item.type === 'NetEase';
    })

    await page.goto(netEase[0].url);

    await page.waitForSelector(domId);

    // 读取 双色球网站 最新 期号
    const versionVal = await page.evaluate(id => {
      let val = Array.from($(id))[0].innerText.replace(/\s/g, '');
      return val;
    }, domId);

    await page.close();

    // 本地的期号 和 网络上最新期号 相同 直接返回
    if (oldVersion == versionVal) {
      return oldVersion;
    } else { // 期号不同  重写本地版本
      let newVersionFile = fs.createWriteStream(path.resolve('./version.json'));
      newVersionFile.write(JSON.stringify({
        version: versionVal
      }), "UTF8");
      newVersionFile.end;
      return versionVal;
    }
  }
  // 声明期号
  const version = await getVersion();

  // 杀号文件
  const killedBallsFile = path.resolve(`./${version}/killedBalls.json`);

  // 汇总 所有号码
  const concatBalls = async () => {

    // 杀掉的号码 写入文件
    await mkdir(version)

    let writeComment1 = fs.createWriteStream(`./${version}/killedBalls.json`);
    writeComment1.write(JSON.stringify(ballData), 'UTF8');
    writeComment1.end();
    createNumbers(ballData, version);
  }
  // 关闭页面
  const closePage = async (page) => {

    await page.close();
    // 已经爬取的页面数量 等于 数据总数 开始汇总
    console.log('end ' + pageIdx);
    if (++pageIdx === urls.length) {
      await concatBalls();
      await borow.close();
    }
  }

  // 获取页面 球 的 数据
  const getBallNum = async (className, page) => {
    const ball = await page.evaluate(cls => {
      const list = Array.from($(cls));
      const arr = list.map(item => {
        return item.innerText.replace(/\s/g, '');
      });
      return arr;
    }, className);
    return ball;
  }

  // 特殊 获取准确率
  const getBallNumSA = async (className, page) => {

    const ball = await page.evaluate(cls => {
      let listBox = document.querySelectorAll(cls);
      let list = listBox[1].querySelectorAll('li');
      const arr = Array.from(list).map(item => {
        return item.innerText.replace(/\s/g, '');
      });
      return arr;
    }, className);
    return ball;
  }
  const createNewBall = (balls, accuracys, type) => {
    let arr = []
    type = type || 1;

    balls.forEach((item, idx) => {
      let newIdx = parseInt(idx / type);
      arr.push({
        number: item,
        accuracy: accuracys[newIdx]
      });
    });
    return arr
  }


  const NetEase = async (kind, page) => {
    const className = '.current .select';
    const accuracyClassName = '.lightBlue .c_ba2636'
    const redBall = await getBallNum(className, page);
    const redAccuracy = await getBallNum(accuracyClassName, page);

    await page.goto('http://zx.caipiao.163.com/shahao/ssq/blue_100.html')
    const blueBall = await getBallNum(className, page);
    const blueAccuracy = await getBallNum(accuracyClassName, page);

    let sum = {
      red: createNewBall(redBall, redAccuracy),
      blue: createNewBall(blueBall, blueAccuracy),
    }


    ballData[kind] = sum;
    await closePage(page);
  }

  const _500_ = async (kind, page) => {
    const redClass = '.nub-ball.nb1';
    const blueClass = '.nub-ball.nb2';

    const redAccuracyClass = '.nub-f12.nub-bg.nub-d3';


    const redBall = await getBallNum(redClass, page);
    const blueBall = await getBallNum(blueClass, page);
    let arr = await page.evaluate(cls => {
      const siblingElem = (elem) => {
        let _nodes = [elem];
        let prev = elem.previousSibling;
        while (prev) {
          if (prev.nodeType === 1) {
            _nodes.unshift(prev);
          }
          prev = prev.previousSibling;
        }

        let next = elem.nextSibling;
        while (next) {
          if (next.nodeType === 1) {
            _nodes.push(next);
          }
          next = next.nextSibling;
        }
        return _nodes;
      }

      const first = document.querySelector(cls);

      let list = siblingElem(first);
      let arr = list.map((item) => {
        let val;
        let child = item.querySelector('.nub-red');
        if (Number(item.innerHTML.split('%')[0])) {
          val = item.innerHTML
        } else if (child && child.innerHTML==='全对') {
          val = '100%'
        } else {
          val = ''
        }
        return val;
      })
      return arr
    }, redAccuracyClass)
    arr.shift();
    arr.pop();

    let redAccuracy = arr.splice(0,5);
    let blueAccuracy = arr.slice();

    let sum = {
      red:createNewBall(redBall,redAccuracy),
      blue:createNewBall(blueBall,blueAccuracy),
    }

    ballData[kind] = sum
    await closePage(page)
  }

  const cjcp = async (kind, page) => {
    const className = '.charttab_bg .winning_red';
    const accuracyClass = '.font_red_blod';
    let redBall = await getBallNum(className, page);
    let redAccuracy = await getBallNum(accuracyClass, page);

    await page.goto("https://zst.cjcp.com.cn/shdd/ssq-lq.html");

    let blueBall = await getBallNum(className, page);
    let blueAccuracy = await getBallNum(accuracyClass, page);


    redBall = redBall.filter(item => Number(item))
    blueBall = blueBall.filter(item => Number(item))

    let sum = {
      red: createNewBall(redBall, redAccuracy),
      blue: createNewBall(blueBall, blueAccuracy),
    }

    ballData[kind] = sum;

    await closePage(page)
  }

  const _360_ = async (kind, page) => {
    const className = '.shdd-table-cont .tbg1';
    const accuracyClass = 'strong.red';

    let redBall = await getBallNum(className, page);
    let redAccuracy = await getBallNum(accuracyClass, page);

    await page.waitForSelector('.sh-blue');
    // 点击 蓝球列表
    await page.tap('.sh-blue');

    await page.waitForSelector('.shdd-table-cont');

    let blueBall = await getBallNum(className, page);
    let blueAccuracy = await getBallNum(accuracyClass, page);

    redBall = redBall.filter(item => Number(item))
    blueBall = blueBall.filter(item => Number(item))
    let sum = {
      red: createNewBall(redBall, redAccuracy),
      blue: createNewBall(blueBall, blueAccuracy),
    }

    ballData[kind] = sum

    await closePage(page)
  }

  const cp2y = async (kind, page) => {
    const className = '.expert';
    const accuracyClass = '.yellow_bg1 .killNumber_body_div2'

    const redBall1 = await getBallNum(className, page);
    const redAccuracy1 = await getBallNumSA(accuracyClass, page)

    await page.goto('https://www.cp2y.com/ssq/ssqsh/h2/');
    const redBall2 = await getBallNum(className, page);
    const redAccuracy2 = await getBallNumSA(accuracyClass, page)

    await page.goto('https://www.cp2y.com/ssq/ssqsh/h3/');
    const redBall3 = await getBallNum(className, page);
    const redAccuracy3 = await getBallNumSA(accuracyClass, page)


    await page.goto('https://www.cp2y.com/ssq/ssqsh/l1/');
    const blueBall1 = await getBallNum(className, page);
    const blueAccuracy1 = await getBallNumSA(accuracyClass, page)

    await page.goto('https://www.cp2y.com/ssq/ssqsh/l2/');
    const blueBall2 = await getBallNum(className, page);
    const blueAccuracy2 = await getBallNumSA(accuracyClass, page)

    let sum = {
      red1: createNewBall(redBall1, redAccuracy1),
      red2: createNewBall(redBall2, redAccuracy2, 2),
      red3: createNewBall(redBall3, redAccuracy3, 3),
      blue1: createNewBall(blueBall1, blueAccuracy1),
      blue2: createNewBall(blueBall2, blueAccuracy2, 2)
    }


    ballData[kind] = sum

    await closePage(page)
  }


  let killedBalls;
  try {
    let jsonStr = await readFile(killedBallsFile, 'utf-8');
    killedBalls = JSON.parse(jsonStr);
  } catch (e) {
    killedBalls = false;
  }

  if (killedBalls) {
    console.log('had killedBalls, No crawling is required ,create Numbers');
    await borow.close();
    createNumbers(killedBalls,version);
  } else {
    urls.forEach(async (item, idx) => {
      (async (item) => {
        const page = await borow.newPage();
        await page.setViewport({
          width: 1376,
          height: 768
        });
        await page.goto(item.url);
        await page.waitFor(2000)

        switch (item.type) {
          case 'NetEase': {
            console.log('run NetEase')
            await NetEase(item.type, page);
            break;
          }
          case '_500_': {
            console.log('run _500_')
            await _500_(item.type, page);
            break;
          }
          case 'cjcp': {
            console.log('run cjcp')
            await cjcp(item.type, page);
            break;
          }
          case '_360_': {
            console.log('run _360_')
            await _360_(item.type, page);
            break;
          }
          case 'cp2y': {
            console.log('run cp2y')
            await cp2y(item.type, page);
            break;
          }
        }
      })(item, idx);
    });
  }


})();


//// 获取页面title
// let title = await (page.title());
//// 循环页面元素
// const carList = await page.evaluate(cls => {
//   console.log(cls)
//   const catBoxs = Array.from($(cls).find('li a'));
//   const cnt = catBoxs.map(v => {
//     const title = $(v).find('h2.t').text();
//     const subTitle = $(v).find('div.t-i').text().split('|');
//     return {
//       title,
//       year: subTitle[0],
//       milemeter: subTitle[1],
//     }
//   })
//   return cnt;
// }, carCls)

