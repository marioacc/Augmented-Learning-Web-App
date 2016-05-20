"use strict";
var express = require('express');
var router =  express.Router();
var Firebase = require("firebase");
var ref = new Firebase("https://popping-fire-7321.firebaseio.com/");
var userRef= ref.child("user");
router.get('/', function(req, res, next) {
  userRef.child(ref.getAuth().uid).once("value", function(snapshot){
    var User =snapshot.val();

    var subjectRef=  ref.child("subject");
    subjectRef.once("value", function(snapshot){
      var subjects = snapshot.val();
      var groupRef = ref.child("group");
      var teacherSubjects=[];
      for (var property in User.subjects){
        if (User.subjects.hasOwnProperty(property)){
          teacherSubjects.push({
            id:User.subjects[property],
            name:subjects[User.subjects[property]].name,
            group: subjects[User.subjects[property]].group
          });
        }
      }

      groupRef.once("value", function(snapshot){
        var groups=snapshot.val();
        var groupList=[];
        var groupsBySubject=[];
        if (teacherSubjects.length>0){
          for(var property in teacherSubjects){
            if (teacherSubjects.hasOwnProperty(property)){
              groupsBySubject.push(
                {
                  group:groups[teacherSubjects[property].group],
                  subjectId:teacherSubjects[property].id,
                  subject:teacherSubjects[property]

                }
              );
            }
          }
        }
        //Get all the groups to create new content and related
        //it to a group
        for (var groupId in groups) {
          if (groups.hasOwnProperty(groupId)) {
            groupList.push({
              groupData: groups[groupId],
              groupId: groupId
            });
          }
        }

        res.render("subjects/subjects", {
          subjectsByGroup:groupsBySubject,
          groups:groupList,
          userId: ref.getAuth().uid.toString()
        });
      });

    });
  });

});


router.post("/new/:userId", function(req,res,next){
  var userId= req.params.userId;
  var subjectName= req.body.name;
  var subjectGroupId= req.body.groupId;
  var userRef= ref.child("user").child(userId);
  var userSubjectsRef= ref.child("user").child(userId).child("subjects");
  var subjectsRef= ref.child("subject");
  var newSubjectRef=subjectsRef.push({
    name: subjectName,
    group: subjectGroupId
  });

  userSubjectsRef.once("value").then(function(snapshot){
   var subjectsList=snapshot.val() || [];
    if(subjectsList.length>0){
      subjectsList.push(newSubjectRef.key());
      userRef.update({
        subjects:subjectsList
      });
    }else{
      subjectsList.push(newSubjectRef.key());
      userRef.update({
        subjects:subjectsList
      })
    }

    res.redirect("subjects/subject");
  }, function (error){
    console.log(error.message);
  });

});

module.exports = router;
