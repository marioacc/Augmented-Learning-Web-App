var Firebase = require("firebase");
var collection ="user/8aac8b16-cfee-484d-bbc4-516ee9322b59/subjects";
var data =["-KAGMywNL-lxUs3p5K8z","-KAGMywUFWgrNZwBvWPk","-KAGMywVBTFkPIHQNzL7 "];

var ref = new Firebase("https://popping-fire-7321.firebaseio.com/");
var collectionRef= ref.child(collection);
collectionRef.set(data);
