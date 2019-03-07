var mongoose = require("mongoose");
mongoose.connect('mongodb://localhost:27017/login',{useNewUrlParser: true });
var Schema = mongoose.Schema;
//骨架模版
var userSchema = new Schema({
    username   : String,
    password   : String,
    id    : String,
    phone : String,
    email  : String
})

var User = mongoose.model('User', userSchema);
module.exports = User;