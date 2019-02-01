const mongoose = require('mongoose')

let imageSchema = new mongoose.Schema({
    id: String,
    title: String,
    content: String,
    type: String,
    tags:[String],
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

imageSchema.pre('save', function (next) {
    this.meta.updateAt = Date.now()
    next()
})
imageSchema.statics = {
    fetch: function (cb) {
        return this
            .find({})
            .sort('meta.updateAt')
            .exec(cb)
    },
    findById: function (id, cb) {
        return this
            .find({ id: id })
            .sort('meta.updateAt')
            .exec(cb)
    },
    fondLast: function (cb) {
        return this
            .findOne({})
            .sort({ 'meta.updateAt': -1 })
            .exec(cb)
    },
    findPage: function (start, cb) { // 分页查询
        let id = start.startkey;
        if (id) {
            return this
                .find({
                    '_id': {
                        "$lt": id
                    }
                })
                .limit(6)
                .sort({ '_id': -1 })
                .exec(cb)
        } else {
            return this
                .find({})
                .limit(6)
                .sort({ 'meta.updateAt': -1 })
                .exec(cb)
        }
    }
}

const joke = mongoose.model("joke", imageSchema)

module.exports = joke