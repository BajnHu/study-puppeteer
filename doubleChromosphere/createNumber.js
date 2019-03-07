const fs = require('fs');
const sd = require('silly-datetime');

// 红球池
const redPool = (()=>{
  let pool = []
  for(let i=1;i<=33;i++){
    pool.push(i)
  }
  return pool;
})();
// 篮球池
const bluePool =(()=>{
  let pool = []
  for(let i=1;i<=16;i++){
    pool.push(i)
  }
  return pool;
})();


Array.prototype.remove = function(val) {
  let index = this.indexOf(val);
  if (index > -1) {
    this.splice(index, 1);
  }
};

module.exports  =   (ballArr,version)=>{
  // 存放最终结果 的 对象
  let numberObj = {};

  // 用每个站点提供的 杀号数据 生成一串号码
  for (let key in ballArr) {

    let redPoolClone = redPool.slice();
    let bluePoolClone = bluePool.slice();
    let {redRes , blueRes } = ballArr[key];

    // 从 池子中 删除 这个站点提供的已经被杀掉的 球
    redRes.forEach((item)=>{
      redPoolClone.remove(item);
    });
    blueRes.forEach((item)=>{
      bluePoolClone.remove(item);
    });
    // 对剩下的球重新排序红球 取前六个 篮球取第一个
    let redNumer = redPoolClone.sort((a,b)=>{
      return .5 - Math.random();
    }).slice(0,6).sort((a,b)=>{
      return a-b;
    });
    let blueNumer = bluePoolClone.sort((a,b)=>{
      return .5 - Math.random();
    })[0];

    numberObj[key] = {
      red:redNumer,
      blue:blueNumer
    }
  }

  // 写入文件
  let file = fs.createWriteStream(`./${version}/$${sd.format(new Date(),'YYYYMMDD_HHmmss')}.json`)
  file.write(JSON.stringify(numberObj),'UTF8');
  file.end();
};

