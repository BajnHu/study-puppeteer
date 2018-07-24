const express = require('express')
const app = express()
const port = process.env.PORT || '9875'
const mongoose = require('mongoose')
const JokeModel = require('./src/db/jokeSchema')
const getSghh = require('./src/getSghh')

mongoose.connect('mongodb://localhost:27017/my_joke')

app.listen(port)

console.log(`server start in port: ${port}`)
// getSghh()

app.get('/api/getJokeData', (req, res) => {
    let resultObj = {
        "success": false
    }
    let data
    let nextId
    if ('types' in req.query && req.query.types !== '') {

    } else {
        JokeModel.fetch((err, jokes) => {
            if (err) {
                console.log(err)
                return
            }
            if (jokes.length > 0) {
                data = jokes[jokes.length - 1]
                nextId =  jokes[jokes.length - 2].id
            }else{
                data = null
                nextId = null
            }
        })
    }
    resultObj = {
        data,
        nextId,
        date:Date.now(),
        code:0
    }
    console.log(req)
    console.log(res)
    return callback()
})


JokeModel.findNextById('4862245',function (err,next) {
    console.log(next)
})