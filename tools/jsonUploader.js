var Firebase = require("firebase");
var jsonToUpload= {
	"user": [{
		"email":"mario.acc.15@gmail.com",
		"username": "mario",
		"password": "mario",
		"groups": [],
		"isTeacher": true
	}, {
		"email":"carlapchavez@gmail.com",
		"username": "carla",
		"password": "carla",
		"groups": [],
		"isTeacher": true
	}],
	"group": [{
		"grade": 1,
		"group": "1B"
	}, {
		"grade": 2,
		"group": "2A"
	}, {
		"grade": 1,
		"group": "2A"
	}],
	"subject": [{
		"name": "geography",
		"group": ""
	}],
	"content": [{
		"name": "Contenido de ejemplo",
		"content": "https://pbs.twimg.com/profile_images/638751551457103872/KN-NzuRl.png",
		"subjectId": ""
	}],
	"pointer": [{
		"content": ""
	}]
};


var ref = new Firebase("https://popping-fire-7321.firebaseio.com/");
for(var collection in jsonToUpload){
  var collectionRef= ref.child(collection);
  jsonToUpload[collection].forEach(function (document){
		if (collection === "user"){
			console.log("User data", JSON.stringify(document));
			ref.createUser({
				email: document.email,
				password: document.password,
				username: document.username,
				groups: document.groups,
				isTeacher: document.isTeacher
			}, function (error, authData){
				if (error){
					console.log("Error sign in->",error);
				}else{
					ref.child("user").child(authData.uid).set({
						email:document.email,
						username:document.username,
						password:document.password,
						groups:document.groups,
						isTeacher:document.isTeacher
			    });
				}
			});
		}else{
			collectionRef.push(document);
		}
  });
}
