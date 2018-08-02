const express = require('express')
const app = express()
const port = process.env.PORT || '9875'
const mongoose = require('mongoose')
const JokeModel = require('./src/db/jokeSchema')


mongoose.connect('mongodb://localhost:27017/jokeCang')

app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});


console.log(`server start in port: ${port}`)


app.get('/api/getJokeData', (req, res) => {
    let data
    let code
    let _callback = req.query.jsonpCallback;
    if ('listindex' in req.query && req.query.listindex !== '') {
        let index = req.query.listindex;
        JokeModel.findOne({"index": index}, (err, joke) => {
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
    } else {
        JokeModel.fondLast(function (err, joke) {
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

