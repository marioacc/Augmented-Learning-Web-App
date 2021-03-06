var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var busboy = require('connect-busboy');

//Routes
var routes = require('./routes/index');
var users = require('./routes/users');
var subjects = require("./routes/subjects");
var pointers= require("./routes/pointers");
var contents= require("./routes/contents");
var themes= require ("./routes/themes");

var session= require("express-session");

var app = express();



/* GET home page. */

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.set('trust proxy', 1);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname, '/bower_components')));
app.use(session({secret:"hshshshshs",resave:true, saveUninitialized:false, name:"token", maxAge: null}));
app.use(busboy());
//Routes
app.all("*", routes);
app.use('/subject',subjects);
app.use("/theme",themes);
app.use('/pointer', pointers);
app.use("/content",contents);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  console.log(req.path);
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});
 var server =  app.listen(process.env.PORT || 3000, function(){
   console.log("Listening");
 });

module.exports = app;
