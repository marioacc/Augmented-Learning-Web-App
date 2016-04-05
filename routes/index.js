"use strict";
var express = require('express');
var router = express.Router();
var Firebase = require("firebase");
var ref = new Firebase("https://popping-fire-7321.firebaseio.com/");
var userRef =ref.child("user");
router.use("/",function(req, res, next){

  if (ref.getAuth()){
    if (!req.app.get("user")){
        userRef.child(ref.getAuth().uid).once("value",function(user){
            req.app.set("user",JSON.stringify(user.val()));
            req.path ==="/" ? res.redirect("/subject") : next();
        });
    }else{
      req.path ==="/" ? res.redirect("/subject") : next();
    }
  }else if (req.cookies.token) {
    ref.authWithCustomToken(req.cookies.token, function(error, authData){
      if (error) {
        res.send(JSON.stringify(error));
      } else {
        if (!req.app.get("user")){
            userRef.child(ref.getAuth().uid).once("value",function(user){
                req.app.set("user",JSON.stringify(user.val()));
                req.path ==="/" ? res.redirect("/subject") : next();
            });
        }
      }
    });
  }else {
    req.path !=="/login"  ? res.render("index") : next();
  }
});

//Login Router
router.post("/login", function(req, res, next){
    var userIdRef;
    var email = req.body.email;
  var password= req.body.password;
  ref.authWithPassword({
    email:email,
    password: password
  },function(error, authData){
    if (error) {
      res.send(JSON.stringify(error));
    } else {

        userIdRef=userRef.child(authData.uid);
        userIdRef.once("value", function (userData){
        req.app.set("user",JSON.stringify(userData.val()));
        res.cookie("token",authData.token);
        if (req.path === "/login") {
          res.redirect("/subject");
        } else {
          next();
        }
      });
    }
  });
});

module.exports = router;
