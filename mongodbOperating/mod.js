const mongoose = require('mongoose')



console.log('\x1B[36m info \x1B[0m'); 
console.log('\x1B[42m \x1B[49m','error'); 

mongoose.connect('mongodb://localhost:27017/user',{
  useNewUrlParser:true
},function(err,d){
  if(err){
    console.log(err)
  }

  let userSchema = {
    name:String,
    age:Number,
    sex:Number
  }

  let User = mongoose.model('user',userSchema)

  User.find({'name':'小明'},function(err,d){
    if(err){
      console.log(err)
    }
    let doc = d[0];
    doc.sex = 0;
    doc.save();
  })
})