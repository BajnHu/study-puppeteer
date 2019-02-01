let mongoose = require('mongoose');
let jokeChema = require('../db/jokeSchema')

mongoose.connect('mongodb://localhost:27017/jokeCang', {
  useNewUrlParser: true
});



// jokeChema.find({_id: {
//     $lte: '5c52bd8dedc0f42c38fe5fe5'
//   }}, function (err, data) {
//   if(err){
//     console.log(err)
//   }else{
//     console.log(data)
//   }
// })

jokeChema.updateMany({ _id: {
  $lte:'5c52bdcaedc0f42c38fe5ff9'
}}, {
  $unset:{index:''}
}, function (err, raw) {
  if (err) return handleError(err);
  console.log('The raw response from Mongo was ', raw);
});

// jokeChema.find({index:0},function(err,data){
//   console.log(data)
// })
// jokeChema.find({index:10}


