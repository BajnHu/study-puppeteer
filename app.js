const express = require('express')
const app = express()
const port = process.env.PORT || '9875'
const mongoose = require('mongoose')
const JokeModel = require('./src/db/jokeSchema')


mongoose.connect('mongodb://localhost:27017/jokeCang',{
  useNewUrlParser:true
},function(err,db){
  if(err){
    console.log('error:'+err)
  }else{
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
    let _callback = req.query.jsonpCallback;
    // 有元素索引  并且 不为空
    if ('listindex' in req.query && req.query.listindex !== '') {
        let index = req.query.listindex;
        // 数据库 根据index 查询
        JokeModel.findOne({"index": index}, function(err, joke){
            if (err) {
                data = null
                code = 1
                res.status(500)
            } else {
                res.status(200)
                if(joke){
                    data = joke
                    code = 0
                }else{
                    data = null
                    code = 1
                }
            }
            if (_callback) {
                res.type('text/javascript');
                res.send(_callback + '(' + JSON.stringify({
                    data,
                    date: Date.now(),
                    code
                }) + ')');
            }
        })
    } else { // 元素索引 为空
        // 数据库查询
        JokeModel.fondLast(function (err, joke) {
            console.log(err,joke)
            if (err) {
                data = null
                code = 1
                res.status(500)
            } else {
                data = joke;
                res.status(200)
                code = 0
            }

            res.type('text/javascript');
            res.send(_callback + '(' + JSON.stringify({
                data,
                date: Date.now(),
                code
            }) + ')');
        })
    }
    res.status(200)
})




app.listen(port)

