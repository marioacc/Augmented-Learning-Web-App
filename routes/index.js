"use strict";
var express = require('express');
var router = express.Router();
var Firebase = require("firebase");
var ref = new Firebase("https://popping-fire-7321.firebaseio.com/");
var userRef =ref.child("user");
router.use("/",function(req, res, next){
    var session= req.session;
  if (ref.getAuth()){
    if (!session.user){
        userRef.child(ref.getAuth().uid).once("value",function(user){
            session.user=JSON.stringify(user.val());
            req.path ==="/" ? res.redirect("/subject") : next();
        });
    }else{
      req.path ==="/" ? res.redirect("/subject") : next();
    }
  }else if (session.token) {
    ref.authWithCustomToken(session.token, function(error, authData){
      if (error) {
        res.send(JSON.stringify(error));
      } else {
        if (!session.user){
            userRef.child(ref.getAuth().uid).once("value",function(user){
                session.user=JSON.stringify(user.val());
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
        var session= req.session;
        userIdRef=userRef.child(authData.uid);
        userIdRef.once("value", function (userData){
            session.user=JSON.stringify(userData.val());
            session.token="token",authData.token;
        if (req.path === "/login") {
          res.redirect("/subject");
        } else {
          next();
        }
      });
    }
  });
});

router.get("/logout", function (req,res,next){
    req.session.destroy();
    ref.unauth();
    res.redirect("/");
});


router.get('/loginUnity', function(req, res, next) {
    var email= req.query.username;
    var password= req.query.password;
    ref.authWithPassword({
        email:email,
        password: password
    },function(error, authData){
        if (error) {
            res.send(null);
        } else {
            // var session= req.session;
            var userIdRef=userRef.child(authData.uid);
            userIdRef.once("value", function (userData){
                res.json({
                    authData:authData,
                    user:userData.val()
                });

            });
        }
    });
});


router.get('/loginUnity', function(req, res, next) {
    var email= req.query.username;
    var password= req.query.password;
    ref.authWithPassword({
        email:email,
        password: password
    },function(error, authData){
        if (error) {
            res.send(null);
        } else {
            // var session= req.session;
            var userIdRef=userRef.child(authData.uid);
            userIdRef.once("value", function (userData){
                res.json({
                    authData:authData,
                    user:userData.val()
                });

            });
        }
    });
});


module.exports = router;
