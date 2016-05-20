/**
 * Created by mario on 3/29/2016.
 */
var express = require('express');
var router = express.Router();
var Firebase = require("firebase");
//var ref = new Firebase("https://popping-fire-7321.firebaseio.com/");
var ref = new Firebase("https://augmentedlearning.firebaseio.com");
var userRef =ref.child("user");

router.post("/new/:subjectId/:themeId", function(req,res,next){
  var contentId = req.body.contentId;
  var subjectId= req.params.subjectId;
  var themeId=req.params.themeId;
  var refPointer = ref.child("pointer");
  refPointer.orderByChild("subject").equalTo(subjectId).once("value", function(snapshot){
    
      for(var pointerId  in snapshot.val()){
        if (snapshot.val().hasOwnProperty(pointerId)){
          refPointer.child(pointerId).update({
            content: contentId
          });
          break;
        }
      }

    res.redirect("/content/"+subjectId+"/"+themeId);
  });

});

module.exports = router;