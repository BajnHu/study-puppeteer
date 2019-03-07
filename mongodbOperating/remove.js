const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/user',{ useNewUrlParser: true } ,function(err,db){

  let userSchema = {
    name :String,
    age:String,
    sex:Number
  }

  let User = mongoose.model('user',userSchema);

  User.remove({name:'小明'},function(err,d){
    if(err){
      console.log(err)
    }
    console.log(d)
  })

})