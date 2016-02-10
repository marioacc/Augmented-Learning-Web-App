"use strict";
var express = require('express');
var router = express.Router();
var Firebase = require("firebase");
var ref = new Firebase("https://popping-fire-7321.firebaseio.com/");
var Parse = require('parse/node');

router.use("/",function(req, res, next){
  if (ref.getAuth()){
    req.path ==="/" ? res.redirect("/subjects") : next();
  }else if (req.cookies.token) {
    ref.authWithCustomToken(req.cookies.token, function(error, authData){
      if (error) {
        res.send(JSON.stringify(error))
      } else {
        req.path==="/" ? res.redirect("/subjects") : next();
      }
    });
    // Parse.User.become(req.cookies.token).then(function (user){
    //   req.path==="/" ? res.redirect("/subjects") : next();
  }else {
    req.path !=="/login" ? res.render("index") : next();
  }
});

//Login Router
router.post("/login", function(req, res, next){
  var email = req.body.email;
  var password= req.body.password;
  console.log(email,password);
  ref.authWithPassword({
    email:email,
    password: password
  },function(error, authData){
    if (error) {
      res.send(JSON.stringify(error))
    } else {
      res.cookie("token",authData.token);
      console.log("Path at login",req.path);
      req.path==="/login" ? res.redirect("/subjects") : next();
    }
  });

  // Parse.User.logIn(name,password).then(function (User){
  //   res.cookie("token", User.getSessionToken());
  //   req.path==="/" ? res.redirect("/subjects") : next();
  // },function(error){
  //   res.send(
  //     "Error: "+JSON.stringify(error));
  //   res.end();
  // });
});

module.exports = router;
