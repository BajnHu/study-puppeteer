const express = require('express')
const app = express()
const port = process.env.PORT || '9875'
const mongoose = require('mongoose')
const JokeModel = require('./JokeCrawler/db/jokeSchema')


mongoose.connect('mongodb://localhost:27017/jokeCang', {
  useNewUrlParser: true
}, function (err, db) {
  if (err) {
    console.log('error:' + err)
  } else {
    console.log('success')
  }
})


// 设置 响应头
app.all('*', function (req, res, next) {
  // 解决跨域
  res.header("Access-Control-Allow-Origin", "*");
  //响应头 请按照自己需求添加。
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  //支持的http 动作
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By", ' 3.2.1');
  // 编码
  res.header("Content-Type", "application/json;charset=utf-8");
  next();
});


console.log(`server start in port: ${port}`)


app.get('/api/getJokeData', (req, res) => {
  let data
  let code
  // 有元素索引  并且 不为空
  let {startkey = '', jsonpCallback} = req.query;

  // 数据库 根据index 查询
  JokeModel.findPage({startkey}, function (err, jokes) {
    if (err) {
      data = null
      code = 1
      res.status(500)
      console.log('err:' + err)
    } else {
      if (jokes) {
        data = jokes
        code = 0
      } else {
        data = null
        code = 1
      }
      res.status(200)
    }

    let resData = data.map((item, idx) => {
      let {title, content, id, type, tags} = item
      return {
        title, content, id, type, tags
      }
    })

    let endkey = data[data.length - 1]._id;
    // 有callback

    res.type('text/javascript');
    res.send(jsonpCallback + '(' + JSON.stringify({
      data: resData,
      date: Date.now(),
      endkey,
      code
    }) + ')');
  })
})


app.listen(port)

