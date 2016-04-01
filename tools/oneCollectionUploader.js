/**
 * Created by mario on 3/16/2016.
 */
var Firebase = require("firebase");
var document=
  {
    "group":"-KAGMywUFWgrNZwBvWPk",
    "name": "Matemathics"
  };

var collection="subject";

var ref = new Firebase("https://popping-fire-7321.firebaseio.com/");
var collectionRef= ref.child(collection);
collectionRef.push(document);


