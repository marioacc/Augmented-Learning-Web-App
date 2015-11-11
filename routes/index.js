var express = require('express');
var router = express.Router();
var parse = require("parse/node");
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post("/login", function(req, res, next){
  var name =req.body.name,
  password= req.body.password;
  parse.initialize("4HcBQOSAIv2T16oGe4jXxmybv3y9Zcio6m1ddebv","aenPoo5zyX6IJY3KuhyxHMDC5a9LmgaI7bNurtXR");
  parse.User.logIn(name, password,{
    success: function(){

    },
    error: function(){

    }
  });
});

module.exports = router;
