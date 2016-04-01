/**
 * Created by mario on 3/29/2016.
 */
var express = require('express');
var router = express.Router();
var Firebase = require("firebase");
var ref = new Firebase("https://popping-fire-7321.firebaseio.com/");

router.post("/new/:subjectId", function(req,res,next){
  var contentRef= ref.child("content");
  var content=req.body.url;
  var contentName=req.body.name;
  var contentDescription= req.body.description;
  var subjectId= req.params.subjectId;
  contentRef.push({
    content:content,
    name:contentName,
    subject:subjectId,
    description:contentDescription
  });
  res.redirect("/subject/"+subjectId);
});

router.get("/delete", function (req,res,next){
  var contentId = req.param("contentId");
  var subjectId= req.param("subjectId");
  var subjectRef= ref.child("content").child(contentId);
  subjectRef.remove().then(function (error){
    if (error){
      console.log(error.message);
    }else{
      res.redirect("/subject/"+subjectId);
    }
  });
});

router.get("/edit", function(req,res,next){
  var contentId= req.param("contentId");
  var subjectId= req.param("subjectId");
  var contentRef= ref.child("content/"+contentId);
  contentRef.once("value", function (snapshot){
    var content=snapshot.val();
    res.render("editContent",{
      name:content.name,
      subject:content.subject,
      content: content.content,
      contentId: contentId,
      subjectId: subjectId
    });
  });

});

router.post("/edit", function(req,res,next){
  var contentId= req.param("contentId");
  var subjectId= req.param("subjectId");
  var name= req.body.name;
  var content= req.body.url;
  var description =req.body.description;
  var contentRef= ref.child("content/"+contentId);
  contentRef.update({
    name:name,
    content:content,
    description: description
  });
  res.redirect("/subject/"+subjectId);
});

module.exports =router;