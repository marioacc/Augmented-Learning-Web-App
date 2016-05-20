/**
 * Created by mario on 4/18/2016.
 */
var express = require('express');
var fs = require('fs');
var path = require('path');
var lineReader = require('line-reader');
var Converter = require("csvtojson").Converter;
var router = express.Router();
var Firebase = require("firebase");
var ref = new Firebase("https://augmentedlearning.firebaseio.com");
//var ref = new Firebase("https://popping-fire-7321.firebaseio.com");
var themesRef= ref.child("themes");
var themeNumberRegEx= /(\d+(?:\.\d+)+)|\d+(?!\.)/;


router.get("/:subjectId", function(req,res,next) {
  var subjectId = req.params.subjectId;
  var themesRef = ref.child("themes");
  var subjectData;

  themesRef.orderByChild("subject").equalTo(subjectId).once("value", function (snapshot) {
    var themes = !snapshot.exists() ? {} : snapshot.val();
    var themesList = [];
    for (var e in themes) {
      if (themes.hasOwnProperty(e)) {
        themesList.push({
          name: themes[e].name,
          number:themes[e].number,
          id: e
        });
      }
    }

    themesList.sort(compareVersionNumbers);
    res.render("themes/index", {
      themes: themesList,
      subjectId:subjectId,
      error: req.query.error
    });

  });
});

router.get("/delete/:subjectId/:themeId",function(req,res,next){
  var themeId=req.params.themeId;
  var subjectId= req.params.subjectId;
  var contentsRef= ref.child("content");
  contentsRef.orderByChild("theme").equalTo(themeId).once("value",function(snapshot){
    var contents = snapshot.val();
    for(var contentId  in contents){
      if (contents.hasOwnProperty(contentId)){
        contentsRef.child(contentId).remove().then(function(){

        },function(err){
          res.redirect("/content/"+subjectId+"/"+themeId);
          return;
        });
      }
    }
    themesRef.child(themeId).remove().then(function(){
      res.redirect("/theme/"+subjectId);
    },function(error){
      res.redirect("/content/"+subjectId+"/"+themeId);
    });
  });
});
router.post("/:subjectId", function(req,res,next){
  var subjectId=req.params.subjectId;
  var converter = new Converter({});
    var fstream;
  req.pipe(req.busboy);
  req.busboy.on('file', function (fieldname, file, filename) {
    console.log("Uploading: " + filename);
    fstream = fs.createWriteStream(path.join(__dirname, path.join('/files/',filename)));
    file.pipe(fstream);
    fstream.on('close', function () {
      converter.fromFile(path.join(__dirname, path.join('/files/',filename)),function(error,result){
        if (error){
          error="Error:"+error;
          res.redirect(req.params.subjectId+"?error="+error);
          return;
        }
        else if (result.length<0){
          error="El documento esta vacio";
           res.redirect(req.params.subjectId+"?error="+error);
          return;

        }
        else if (!result[0].hasOwnProperty("Numero") || !result[0].hasOwnProperty("Nombre")) {
          error="El nombre de la primera columna debe de ser Numero y el de la segunda conlumna debe de ser Nombre";
          res.redirect(req.params.subjectId+"?error="+error);
          return;
        }else {
          for (var i=0; i<result.length;i++){
            var theme=result[i];
            if (!themeNumberRegEx.test(theme.Numero) ) {
              error="El numero "+theme.Numero+" no puede estar vacio, y debe de empezar con un numero y terminar con un numero";
              res.redirect(req.params.subjectId+"?error="+error);
              return;
            }else if (theme.Nombre===undefined || theme.Nombre.length < 1){
              error="El nombre de tema no puede estar vacio";
              res.redirect(req.params.subjectId+"?error="+error);
              return;
            }
          }


        }

        var lastThemeNumber="0";
        var newTheme={
          name:"",
          number:"",
          subject:""
        };
        var ThemeAndSubthemes={
          name: result[0].Nombre,
          number: result[0].Numero.toString(),
          subject:req.params.subjectId,
          subthemes:[]
        };

        themesRef.orderByChild("subject").equalTo(subjectId).once("value",function(datasnapshot){
          var propertyToSearchInInnerObjects="number";
          var themes= datasnapshot.val();
          var isThemeInDatabase;
          for(var index=1; index<result.length;index++){
            isThemeInDatabase=ObjectInObjectFindProperty(themes,propertyToSearchInInnerObjects,result[index]["Numero"].toString());
            if(result[index].Numero.toString()[0] === ThemeAndSubthemes.number[0]){
              newTheme={
                name: result[index].Nombre,
                number: result[index].Numero.toString(),
                subject:req.params.subjectId
              };
              if (isThemeInDatabase){
                themesRef.child(isThemeInDatabase).update({name:newTheme.name});
              }else{
                ThemeAndSubthemes.subthemes.push(themesRef.push(newTheme).key());
              }

            }else{
              isThemeInDatabase=ObjectInObjectFindProperty(themes,propertyToSearchInInnerObjects,ThemeAndSubthemes.number);
              if (isThemeInDatabase){
                ThemeAndSubthemes.subthemes=ThemeAndSubthemes.subthemes.concat(themes[isThemeInDatabase].subthemes);
                themesRef.child(isThemeInDatabase).update({
                  name:ThemeAndSubthemes.name,
                  subthemes:ThemeAndSubthemes.subthemes});
                ThemeAndSubthemes={
                  name: result[index].Nombre,
                  number: result[index].Numero.toString(),
                  subject:req.params.subjectId,
                  subthemes:[]
                };
              }else {
                themesRef.push(ThemeAndSubthemes);
                ThemeAndSubthemes={
                  name: result[index].Nombre,
                  number: result[index].Numero.toString(),
                  subject:req.params.subjectId,
                  subthemes:[]
                };
              }
            }
          }
          isThemeInDatabase=ObjectInObjectFindProperty(themes,propertyToSearchInInnerObjects,ThemeAndSubthemes.number);
          if(isThemeInDatabase){
            ThemeAndSubthemes.subthemes=ThemeAndSubthemes.subthemes.concat(themes[isThemeInDatabase].subthemes);
            themesRef.child(isThemeInDatabase).update({
              name:ThemeAndSubthemes.name,
              subthemes:ThemeAndSubthemes.subthemes});
          }else{
            themesRef.push(ThemeAndSubthemes);
            ThemeAndSubthemes={
              name: result[result.length-1].Nombre,
              number: result[result.length-1].Numero.toString(),
              subject:req.params.subjectId,
              subthemes:[]
            };
          }
          fs.unlink(path.join(__dirname, path.join('/files/',filename)), (err)=>{
            if (err) console.log(err);
            res.redirect("/theme/"+req.params.subjectId);
          });
        })
      ;})
    ;});
  });
});

var ObjectInObjectFindProperty= function (array,property,value){
  for (var elementName in array){
    if (array.hasOwnProperty(elementName) && array[elementName][property]===value){
      return elementName;
    }
  }
  return false;
};
function compareVersionNumbers(v1, v2){
  var v1parts = v1.number.split('.');
  var v2parts = v2.number.split('.');

  // First, validate both numbers are true version numbers
  function validateParts(parts) {
    for (var i = 0; i < parts.length; ++i) {
      if (!isPositiveInteger(parts[i])) {
        return false;
      }
    }
    return true;
  }


  for (var i = 0; i < v1parts.length; ++i) {
    if (v2parts.length === i) {
      return 1;
    }

    if (v1parts[i] === v2parts[i]) {
      continue;
    }
    if (v1parts[i] > v2parts[i]) {
      return 1;
    }
    return -1;
  }

  if (v1parts.length != v2parts.length) {
    return -1;
  }

  return 0;
}
function isPositiveInteger(x) {
  // http://stackoverflow.com/a/1019526/11236
  return /^\d+$/.test(x);
}
module.exports=router;