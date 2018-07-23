
const http = require('http')
const https = require('https')
const fs = require('fs')
const path = require('path')
const {promisify} = require('util')
const wirteFile = promisify(fs.writeFile)

module.exports = async (src, dir) => {

    if(/\.(jpg|png|gif)$/.test(src)&&/^http/.test(src)){
        console.log(src)
        await urlToImg(src,dir)
    }else{
        await base64TpImg(src,dir)
    }

}

// url => db_image.js
const urlToImg = promisify((url, dir, callback) => {
    let mod = /'^https'/.test(url) ? https : http
    const ext = path.extname(url)
    const filename = path.join(dir, `normal${Date.now()}${ext}`)
    try {
        mod.get(url, res => {
            res.pipe(fs.createWriteStream(filename))
                .on('finish', () => {
                    callback()
                })
        })
    }catch (e){ // 协议不支持
        console.log('协议不支持')
        mod = /'^https'/.test(url) ? http : https
        mod.get(url, res => {
            res.pipe(fs.createWriteStream(filename))
                .on('finish', () => {
                    callback()
                })
        })
    }

})

//base64 => db_image.js

const base64TpImg = async (base64Str, dir) => {
    let matches = base64Str.match(/^data:(.+?);base64,(.+)$/)
    try {
        let ext = matches[1].split('/')[1].replace('jpeg', 'jpg')
        let file = path.join(dir, `base64${Date.now()}.${ext}`)
        await wirteFile(file, matches[2], 'base64')
    } catch (e) {
        console.warn('非法bsse64:' + e)
    }
}