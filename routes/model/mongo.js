var mongojs = require('mongojs');
// var url = 'mongodb://<augmentedlearning>:<augmented123>@ds055565.mongolab.com:55565/augmentedlearning';
var url = 'augmentedlearning';
var db = mongojs(url, ["Content","Group","Pointer","Subject","User"]);
var jwt = require('jsonwebtoken');
var secretKey = "thisIsNotAS3cr3tK31";
var Mongo={};
Mongo.login = function (user, password){
  db.User.findOne({username:user}, function (error, user){
    if (error !== null){
      return {
        login:false,
        message:error.message
      };
    }else if (user === null){
      return {
        login:false,
        message: "User not found"
      };
    }else if (user.username === user && user.password !== password){
      return {
        login:false,
        message: "Incorrect Password"
      };
    }
    else if(user.username === user && user.password === password) {
      var token= jwt.sign(user, secretKey, {
          expiresIn: "365 days" // expires in 24 hours
      });
      return {
        login:true,
        token: this.token
      };
    }
  });
}();


module.exports = db;
