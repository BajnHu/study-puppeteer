const fs = require('fs');
const sd = require('silly-datetime');
const {promisify} = require('util')
const readFile = promisify(fs.readFile)
const path = require('path');




// 红球池
  const redPool = (() => {
    let pool = []
    for (let i = 1; i <= 33; i++) {
      pool.push(i)
    }
    return pool;
  })();
// 篮球池
  const bluePool = (() => {
    let pool = []
    for (let i = 1; i <= 16; i++) {
      pool.push(i)
    }
    return pool;
  })();


  Array.prototype.remove = function (val) {
    let index = this.indexOf(val);
    if (index > -1) {
      this.splice(index, 1);
    }
  };

  module.exports = async (ballData, version) => {
    const versionFile = path.resolve(`./${version}/killballsSort.json`);
    // 存放最终结果 的 对象
    let numberObj = {
      red: [],
      blue: []
    };

    // 根据 准确率 排序分组 数据
    for (let web in ballData) {
      for (let key in ballData[web]) {
        if (/red/.test(key)) {
          numberObj.red = numberObj.red.concat(ballData[web][key])
        } else if (/blue/.test(key)) {
          numberObj.blue = numberObj.blue.concat(ballData[web][key])
        }
      }
    }

    numberObj.red.sort((a, b) => {
      let aK = parseInt(a.accuracy.split('%')[0]);
      let bK = parseInt(b.accuracy.split('%')[0]);
      return bK - aK;
    })

    numberObj.blue.sort((a, b) => {
      let aK = parseInt(a.accuracy.split('%')[0]);
      let bK = parseInt(b.accuracy.split('%')[0]);
      return bK - aK;
    })

    let red = numberObj.red.filter((item) => {
      return parseInt(item.accuracy.split('%')[0]) >= 85
    });
    let blue = numberObj.blue.filter((item) => {
      return parseInt(item.accuracy.split('%')[0]) >= 95
    });

    // 杀号根据概率排序 写入文件
    try {
      let jsonStr = await
      readFile(versionFile, 'utf-8');
      console.log('had create killballSortList , goon create Numbers');
    } catch (e) {
      console.log('have not create killballSortList ,creating');
      let file = fs.createWriteStream(`./${version}/killballsSort.json`)
      file.write(JSON.stringify(numberObj), 'UTF8');
      file.end();
      console.log('created');
    }




    red = red.map((item) => {
      return item.number
    })
    blue = blue.map((item) => {
      return item.number
    })
    red = Array.from(new Set(red));
    blue = Array.from(new Set(blue));


    red.forEach((item) => {
      redPool.remove(Number(item))
    })

    blue.forEach((item) => {
      bluePool.remove(Number(item))
    })


    let result = []
    for (let i = 0; i < 5; i++) {
      redPool.sort((a,b)=>{
        return Math.random()>0.5;
      });
      bluePool.sort((a,b)=>{
        return Math.random()>0.5;
      });
      console.log(bluePool);
      result.push({
        red:redPool.slice(0,6).sort((a,b)=>{return a-b}),
        blue:bluePool.slice(0,1)
      })
    }
    console.log(version);
    // 写入文件
    let file = fs.createWriteStream(`./${version}/$${sd.format(new Date(),'YYYYMMDD_HHmmss')}.json`)
    file.write(JSON.stringify(result),'UTF8');
    file.end();



  };

