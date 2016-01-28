"use strict";
var express = require('express');
var router = express.Router();
var Parse = require('parse/node');

Parse.initialize("4HcBQOSAIv2T16oGe4jXxmybv3y9Zcio6m1ddebv","aenPoo5zyX6IJY3KuhyxHMDC5a9LmgaI7bNurtXR");

router.use("/",function(req, res, next){
  if (Parse.User.current()){
    req.path ==="/" ? res.redirect("/subjects") : next();
  }else if (req.cookies.token) {
    Parse.User.enableUnsafeCurrentUser();
    Parse.User.become(req.cookies.token).then(function (user){
      req.path==="/" ? res.redirect("/subjects") : next();
    }, function(error){
      console.log(JSON.stringify(error));
      res.end();
    });
  }else {
    req.path !=="/login" ? res.render("index") : next();
  }
});

//Login Router
router.post("/login", function(req, res, next){
  var name = req.body.username;
  var password= req.body.password;
  Parse.User.logIn(name,password).then(function (User){
    res.cookie("token", User.getSessionToken());
    req.path==="/" ? res.redirect("/subjects") : next();
  },function(error){
    res.send(
      "Error: "+JSON.stringify(error));
    res.end();
  });
});
// router.post("/login", function(req, res, next){
//   var name =req.body.username;
//   var password= req.body.password;
//   Parse.User.logIn(name, password,{
//     success: function(user) {
//       res.cookie("token",user.getSessionToken());
//       res.redirect("/subjects");
//     },
//     error: function(error) {
//       res.send(
//         "Error: "+JSON.stringify(error));
//       res.end();
//     }
//   });
// });

module.exports = router;
