/**
 * Created by mario on 4/18/2016.
 */
var express = require('express');
var fs = require('fs');
var path = require('path');

var Converter = require("csvtojson").Converter;
var router = express.Router();
var Firebase = require("firebase");
var ref = new Firebase("https://augmentedlearning.firebaseio.com/");
var themesRef= ref.child("themes");
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
      subjectId:subjectId
    });

  });
});

router.post("/:subjectId", function(req,res,next){
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
          console.log(error)
        }else{
          var lastThemeNumber="0";
          var newTheme={};
          var ThemeAndSubthemes={
            name: result[0].Nombre,
            number: result[0].Numero.toString(),
            subject:req.params.subjectId,
            subthemes:[]
          };
          for(var index=1; index<result.length;index++){
            if(result[index].Numero.toString()[0] === ThemeAndSubthemes.number[0]){
              newTheme={
                name: result[index].Nombre,
                number: result[index].Numero.toString(),
                subject:req.params.subjectId
              };
              ThemeAndSubthemes.subthemes.push(themesRef.push(newTheme).key());
            }else{
              themesRef.push(ThemeAndSubthemes);
              ThemeAndSubthemes={
                name: result[index].Nombre,
                number: result[index].Numero.toString(),
                subject:req.params.subjectId,
                subthemes:[]
              };
            }
          }
          themesRef.push(ThemeAndSubthemes);
          res.redirect("/theme/"+req.params.subjectId);
        }
      });
    });
  });

});


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