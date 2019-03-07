// 加密 模块
var crypto = require('crypto')
var fs = require('fs')
var path = require('path');
var express = require('express');
var app = express();
// 中间件 解析请求体 模块
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false })

let mongoose = require('mongoose');
let User = require('../model/schema');
let router = express.Router();

//设置name给value。可以存储所需的任何值
app.set('views', __dirname + '/../view')
app.set('view engine', 'ejs')

// 定义局部变量
let jsonArray = [];
let numOfJson = 0;
let errorInfo = '';
let usernameInRequest;

app.use(express.static(__dirname + '/public'));


router.get('/regist', function (req, res) {
  res.render('index.ejs', {
    errorInfo: '请输入信息'
  })
});

router.get('/', function (req, res) {
  console.log(req.session)
  if (!req.session.logged_in) {
    Notlogin(req, res)
  } else {
    loggedIn(req, res)
  }
})

router.get('/logout', function (req, res) {
  req.session.logged_in = 0;
  res.render('signin.ejs', {
    errorInfo: '请输入信息'
  })
})

router.post('/check', urlencodedParser, function (req, res) {
  console.log('check password');
  var testuser = {
    username: req.body.username,
    password: req.body.password
  }

  let d = getMD5Password(testuser.password)

  console.log('加密结果：{验证}' + d)

  testuser.password = d;
  User.find(testuser, function (err, detail) {
    if (err) {
      console.log(err)
    } else {
      if (detail.length) {
        signinCheckSuccess(detail, req, res)
      } else {
        console.log('wrong!')
        errorInfo = "用户名不存在或密码错误";
        res.render('signin.ejs', {
          errorInfo
        })
      }
    }
  })
})

router.post('/info', urlencodedParser, function (req, res) {
  console.log("Data from submit form");
  var user = new User({
    username: req.body.username,
    password: req.body.password,
    id: req.body.id,
    phone: req.body.phone,
    email: req.body.email
  })
  var d = getMD5Password(user.password);

  console.log('加密结果：' + d);

  user.password = d;
  console.log(user)
  var flag = {
    one: 1,
    two: 1,
    three: 1,
    four: 1
  };

  errorInfo = ''

  checkDataReq(user, flag, req, res)
})



function getMD5Password(pwd){
  //定义加密方式:md5不可逆,此处的md5可以换成任意hash加密的方法名称；
  let md5 = crypto.createHash('md5');

  md5.update(pwd);

  return md5.digest('hex');
}

function signinCheckSuccess(detail,req,res){
  var userInDatabase = {
		username:detail[0].username,
		userId:detail[0].id,
		phone:detail[0].phone,
		email:detail[0].email
  }
  
  console.log("user in database :");
  console.log(userInDatabase);
  
  req.session.logged_in = 1;
  req.session.username = req.body.username;
  showInfo(userInDatabase,res)
}


function checkDataReq(userinfo,flag,req,res){
  let {username,id,phone,email} = userinfo;

  User.find({username},function(err,detail){
    if(err){
      console.log(err)
    }else{
      if(detail.lenght){
        flag.one = 0;
        errorInfo = errorInfo + "用户名重复\n";
      }
    }
  });
  User.find({id},function(err,detail){
    if(err){
      console.log(err)
    }else{
      if(detail.lenght){
        flag.two = 0;
        errorInfo = errorInfo + "id重复\n";
      }
    }
  });
  User.find({phone},function(err,detail){
    if(err){
      console.log(err)
    }else{
      if(detail.lenght){
        flag.three = 0;
        errorInfo = errorInfo + "电话号码重复\n";
      }
    }
  });
  User.find({email},function(err,detail){
    if(err){
      console.log(err)
    }else{
      if(detail.lenght){
        flag.four = 0;
        errorInfo = errorInfo + "邮箱重复\n";
      }

      dealWithDataSubmited(userinfo,flag,req,res)
    }
  });
}

function dealWithDataSubmited(userinfo,flag,req,res){
  if (!(flag.one&&flag.two&&flag.three&&flag.four)) {
    repreload(res);
  }else{
 
    userinfo.save(function(err){
      if(err){
        console.log('保存失败');
        return
      }
      console.log("保存成功")

      req.session.username= userinfo.username;
      req.session.logged_in = 1;
      console.log(userinfo.username + " has been added");
		  showInfo(userinfo, res)
    })
  }
}

function repreload(res){
  res.render('index.ejs',{
    errorInfo
  })
}



function Notlogin(req, res) {
  if (req.param('username') === undefined) {
    console.log('initail page');
    res.render('signin.ejs', {
      errorInfo: '请输入信息'
    })
  } else {
    var username = req.param('username').toString();
    console.log('find user:' + username)
    findJson(username, res)
  }
}

function loggedIn(req, res) {
  if (req.param("username") == undefined) {
    findJson(req.session.username, res);
  } else {
    let username = req.param('username').toString();
    console.log(username);
    let sessionName = req.session.username;
    let testUsername = { username: sessionName };

    User.find(testUsername, function (err, userDetail) {
      if (err) {
        console.log(err)
      } else {
        let text = username != sessionName ? '只能显示已登录用户' : '用户详情';
        infoPage(res, userDateil, text)
      }
    })
  }
}

function findJson(username, res) {
  var testUser = { username };
  User.find(testUser, function (err, userDetail) {
    if (err) {
      console.log(err)
    } else {
      console.log()
      if (userDetail.length) {
        console.log(userDetail);
        res.render('index.ejs', {
          errorInfo: '请输入信息'
        })
      } else {
        console.log(userDetail);
        console.log("Load user: " + name);
        console.log(userDetail[0]);
        showInfo(userDetail[0], res);
      }
    }
  })
}

function showInfo(user, res) {
  res.render('info.ejs', {
    username: user.username,
    userId: user.id,
    phone: user.phone,
    email: user.email,
    errorInfo: '用户详情'
  });
}

function infoPage(res,userDetail,text){
  res.render('info.ejs', {
		username:userDetail[0].username,
		userId:userDetail[0].id,
		phone:userDetail[0].phone,
		email:userDetail[0].email,
		errorInfo:text
	})
}



module.exports = router