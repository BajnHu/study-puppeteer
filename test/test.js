const mongoose = require('mongoose')


mongoose.connect('mongodb://localhost:27017/my_joke',{
  useNewUrlParser:true
},function(err){

  if(err){
    console.log('error:'+err)
  }else{
    console.log('success')
  }
})

// mongoose.connect('mongodb://localhost:27017/my_joke')




