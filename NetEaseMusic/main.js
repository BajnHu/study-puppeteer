const fs = require('fs');

const puppeteer = require('puppeteer');

(async () => {

  const brower = await puppeteer.launch({
    headless: false
  });

  const page = await brower.newPage()

  await page.setViewport({
    width: 1376,
    height: 768
  });

  await page.goto('https://music.163.com/')

  const musicName = '儿子儿子';


  await page.type('.txt.j-flag', musicName, { delay: 0 });

  await page.keyboard.press('Enter')

  await page.waitFor(2000)

  let iframe = await page.frames().find((f) => {
    return f.name() === 'contentFrame'
  })


  const SONG_LS_SELECTOR = await iframe.$('.srchsongst');

  const selectedSongHref = await iframe.evaluate(e => {
    const songList = Array.from(e.childNodes);
    const idx = songList.findIndex(v => /儿子儿子/.test(v.childNodes[1].innerText.replace(/\s/g, '')));
    console.log(idx)
    return songList[idx].childNodes[1].firstChild.firstChild.firstChild.href;
  }, SONG_LS_SELECTOR);

  console.log(selectedSongHref)

  // 进入歌曲页面
  await page.goto(selectedSongHref);

  // 获取歌曲页面桥套 iframe
  await page.waitFor(2000)
  let iframe2 = await page.frames().find((item) => {

    return item.name() === 'contentFrame'
  })

  // 点击展开按钮
  const unfolBtn = await iframe2.$('#flag_ctrl');
  await unfolBtn.click();

  //获取歌词 
  const LYRIC_SELECTOR = await iframe2.$('#lyric-content');
  const lyricCtn = await iframe2.evaluate(e => {
    return e.innerText
  }, LYRIC_SELECTOR);

  console.log(lyricCtn)

  let writeStream = fs.createWriteStream('歌词.txt');
  writeStream.write(lyricCtn, 'utf8')
  writeStream.end()

  // 获取评论数量
  const commentCount = await iframe2.$eval('.sub.s-fc3', e => e.innerText)
  console.log(commentCount)

  let commentList = '';
  let getComment = async () => {
    let commentPgnum = await iframe2.$$eval('.zpgi', elements => elements.length);
    let pgnum = 1;

    let commentStr = async () => {
      await page.waitFor(1000)
      commentList += await iframe2.$$eval('.itm', elements => {
        const ctn = elements.map(v => {
          return '\n' + v.innerText.replace(/\s/g, '');
        })
        return ctn;
      })

      let nextBtn = await iframe2.$('.znxt');
      await nextBtn.click()
      if (++pgnum < commentPgnum) {
        await commentStr()
      }
    }
    await commentStr();
  }

  await getComment();

  // 获取评论

  console.log(commentList)

  let writeComment = fs.createWriteStream('评论.txt')
  writeComment.write(commentList, 'UTF8')
  writeComment.end()

  // brower.close();
})()