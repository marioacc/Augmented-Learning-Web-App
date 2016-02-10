"use strict";
var express = require('express');
var router =  express.Router();
var Parse = require('parse/node');

Parse.initialize("4HcBQOSAIv2T16oGe4jXxmybv3y9Zcio6m1ddebv","aenPoo5zyX6IJY3KuhyxHMDC5a9LmgaI7bNurtXR");
console.log("At subjects.js file");
/* GET all the subjects. */
router.get('/', function(req, res, next) {
  res.send("subjects section");
//   console.log("In subjects section");
//   var subject= Parse.Object.extend("Subject");
//   var group= Parse.Object.extend("Group");
//   var teacherSubjects =new Parse.Query(subject);
//   var teacherGroups = new Parse.Query(group);
//   var subjectsByGroup=[];
//   teacherGroups.containedIn("name", Parse.User.current().get("Groups"));
//   teacherGroups.find().then( function (groups) {
//     teacherSubjects.containedIn("Group", groups);
//     teacherSubjects.each(function(subjectElement){
//       groups.forEach(function(groupElement){
//         if (subjectElement.get("Group").id === groupElement.id){
//           subjectsByGroup.push({
//             subject: subjectElement,
//             group: groupElement
//           });
//         }
//       });
//       res.render("subjects",{subjectsByGroup});
//     });
//     }, function(error){
//   });
// });
//
// router.get("/new", function (req, res, next){
//   var name=req.query.name;
//   var url=req.query.url;
//   var subjectId=req.query.subject;
//
//   var SubjectContent = Parse.Object.extend("SubjectContent");
//   var Subject = Parse.Object.extend("Subject");
//   var subjectsQuery = new Parse.Query(Subject);
//   var subjectContent = new SubjectContent();
//   subjectsQuery.get(subjectId).then(function(subject){
//     subjectContent.set("name", name);
//     subjectContent.set("content", url);
//     subjectContent.set("subject", subject);
//     subjectContent.save().then( function(subjectContent){
//       res.redirect("/subjects/"+subjectId);
//     }, function (error){
//         console.log(error.message) ;
//     });
//   }, function(error){
//     console.log(eror.message);
//   });
});

router.get("/:subjectId", function(req,res,next){
  var subject= Parse.Object.extend("Subject");
  var subjects = new Parse.Query(subject);
  var subjectId= req.params.subjectId;
  var sub;
  // console.log("Subject Id ------>"+subjectId);
  subjects.get(subjectId).then( function (subject){
    var groupId = subject.get("Group").id;
    var group = Parse.Object.extend("Group");
    var groups = new Parse.Query(group);
    return groups.get(groupId);
  }).then(function (group){
    // console.log(JSON.stringify(subject));
    var subjectContents =  Parse.Object.extend("SubjectContent");
    var subjectContent = new Parse.Query(subjectContents);
    subjectContent.equalTo("subject",subject).find().then(function (content){
      // console.log(JSON.stringify(content[0]));
      res.render("subjectContent", {contents:content});

    })
    // res.render("subjectId",{subject});
  }, function (error){
    res.send(error.message);
  });
});

module.exports = router;
