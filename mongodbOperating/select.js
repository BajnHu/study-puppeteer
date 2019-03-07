const mongoose = require('mongoose');
const userSchema = require('./userSchema.js'); 


mongoose.connect('mongodb://localhost:27017/user',
  {useNewUrlParser:true},
  function(err,db){
    if(err){
      console.log(err)
    }
    success()
  }
)


function success() {
  let User =  mongoose.model('user',userSchema)

  User.find({'age':{$eq:12}},function(err,db){

    if(err){
      console.log(err)
    }

    console.log(db)
  })
}