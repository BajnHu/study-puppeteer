const mongoose = require('mongoose')
const userSchema = require('./userSchema.js'); 

mongoose.connect('mongodb://localhost:27017/user', 
{useNewUrlParser:true},
function(err,db){
  if(err){
    console.log('connect error:'+err)
  }else{
    console.log('connect success')
    success(db)
  }
});

function success(db) {
  //创建一个模型（就是一个类）
  let User = mongoose.model('user',userSchema)
  //new一个实例

  var xiaoming = new User({
    "name": "小明",
    "age": 12,
    "sex": 1
  })

  xiaoming.save()
}
