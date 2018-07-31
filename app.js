const express = require('express')
const app = express()
const port = process.env.PORT || '9875'
const mongoose = require('mongoose')
const JokeModel = require('./src/db/jokeSchema')


mongoose.connect('mongodb://localhost:27017/my_joke')

app.listen(port)

console.log(`server start in port: ${port}`)


app.get('/api/getJokeData', (req, res) => {
    let data
    if ('listindex' in req.query && req.query.listindex !== '') {
        let index = req.query.listindex;
        JokeModel.find({"index":index},(err, joke) => {
            if (err) {
                console.log(err)
                return
            }
            res.json({
                data:joke,
                date:Date.now(),
                code:0
            })
        })
    } else {
        JokeModel.fondLast(function (err,joke) {
            if(err){
                console.log(err)
            }else{
                data = joke;
                res.status(200)
                res.json({
                    data,
                    date:Date.now(),
                    code:0
                })
            }
        })
    }
})


