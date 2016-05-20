/**
 * Created by mario on 3/29/2016.
 */
var express = require('express');
var router = express.Router();
var Firebase = require("firebase");
// var ref = new Firebase("https://popping-fire-7321.firebaseio.com/");
var ref = new Firebase("https://augmentedlearning.firebaseio.com");

//Gets all the contents for the specified subjectId and themeId
router.get("/:subjectId/:themeId", function(req,res,next){
  var subjectId=req.params.subjectId;
  var themeId= req.params.themeId;
  var subjectRef= ref.child("subject").child(subjectId);
  var contentRef= ref.child("content");
  var subjectData;
  contentRef.orderByChild("theme").equalTo(themeId).once("value", function (snapshot) {
    var contentList=[];
    var contentData= snapshot.val();
    for (var contentId in contentData){
      if(contentData.hasOwnProperty(contentId)){
        contentList.push({
          contentData:contentData[contentId],
          contentId:contentId
        });
      }
    }
    ref.child("themes").child(themeId).once("value",function(snapshot){
      var themeName;
      var themeNumber;
      if(snapshot.exists()){
        var theme=snapshot.val();
        themeName=theme.name;
        themeNumber=theme.number;
      }
      ref.child("pointer").orderByChild("subject").equalTo(subjectId).once("value", function (snapshot){
        var selectedPointer;
        if (snapshot.exists()){
          var pointer =snapshot.val();
          selectedPointer=pointer[Object.keys(pointer)[0]].content;
        }
        res.render("content/index",{
          contentList:contentList,
          themeId: themeId,
          themeNumber: themeNumber || " ",
          themeName: themeName || " ",
          subjectId: subjectId,
          selectedPointer:selectedPointer
        });
      }); 
    });
  });
});

router.post("/new/:subjectId/:themeId", function(req,res,next){
  var contentRef= ref.child("content");
  var content=req.body.url;
  var contentName=req.body.name;
  var contentDescription= req.body.description;
  var subjectId= req.params.subjectId;
  var themeId= req.params.themeId;
  var type="link";
  var order=1;
  contentRef.push({
    content:content,
    name:contentName,
    subject:subjectId,
    theme:themeId,
    description:contentDescription,
    type:type,
    order:order
  });
  res.redirect("/content/"+subjectId+"/"+themeId);
});

router.get("/delete", function (req,res,next){
  var contentId = req.query.contentId;
  var subjectId= req.query.subjectId;
  var themeId= req.query.themeId;
  var subjectRef= ref.child("content").child(contentId);
  subjectRef.remove(function (error){
    if (error){
      console.log(error.message);
    }else{
      ref.child("pointer").orderByChild("content").equalTo(contentId).once("value",function(snapshot){
        var pointer= snapshot.val();
        if (pointer && pointer[Object.keys(pointer)[0]].content===contentId) {
          ref.child("pointer").child(Object.keys(pointer)[0]).remove(function (error) {

              res.redirect("/content/" + subjectId + "/" + themeId);

          });
        }else{
          res.redirect("/content/"+subjectId+"/"+themeId);
        }


      });

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