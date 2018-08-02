const mongoose = require('mongoose')

let imageSchema = new  mongoose.Schema({
    id:String,
    index:Number,
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
    },
    fondLast:function (cb) {
        return this
            .findOne({})
            .sort({'meta.updateAt':-1})
            .exec(cb)
    }
}

const joke = mongoose.model("jokeCang",imageSchema,'jokeCang')

module.exports = joke