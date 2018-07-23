const mongoose = require('mongoose')

let imageSchema = new  mongoose.Schema({
    id:String,
    title:String,
    content:String,
    type:String,
    meta: {
        createAt: {
            type: Date,
            default: Date.now()
        },
        updateAt: {
            type: Date,
            default: Date.now()
        }
    }
})

imageSchema.pre('save',function (next) {
    this.meta.updateAt = Date.now()
    next()
})
imageSchema.statics = {
    fetch:function (cb) {
        return this
            .find({})
            .sort('meta.updateAt')
            .exec(cb)
    },
    findById:function (id, cb) {
        return this
            .find({id:id})
            .sort('meta.updateAt')
            .exec(cb)
    }
}

const joke = mongoose.model("my_joke",imageSchema,'my_joke')

module.exports = joke