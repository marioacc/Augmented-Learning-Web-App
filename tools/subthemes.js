/**
 * Created by mario on 4/25/2016.
 */

var Firebase = require("firebase");
var ref = new Firebase("https://augmentedlearning.firebaseio.com/");
var themesRef= ref.child("themes");

var Converter = require("csvtojson").Converter;

var converter = new Converter({});

converter.fromFile("./themes.csv",function(error,result){

  if (error){
    console.log(error)
  }else{
    var lastThemeNumber="0";
    var ThemeAndSubthemes={
      name: result[0].Nombre,
      number: result[0].Numero.toString(),
      subthemes:[]
    };
    for(var index=1; index<result.length;index++){
      if(result[index].Numero.toString()[0] === ThemeAndSubthemes.number[0]){
        ThemeAndSubthemes.subthemes.push(themesRef.push(result[index]).key());
      }else{
        themesRef.push(ThemeAndSubthemes);
        ThemeAndSubthemes={
          name: result[index].Nombre,
          number: result[index].Numero.toString(),
          subthemes:[]
        };
      }
    }
    themesRef.push(ThemeAndSubthemes);
  }
});