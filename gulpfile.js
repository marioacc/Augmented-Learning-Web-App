var gulp = require("gulp");
var nodemon = require("gulp-nodemon");
gulp.task('start', function () {
  nodemon({
    script: 'app.js'
  , ext: 'js html jade'
  , env: { 'NODE_ENV': 'development' }
  });
});

gulp.task('debug', function () {
  nodemon({
    exec: 'node-inspector & nodemon --debug app.js'
  , script: 'app.js'
  , ext: 'js html jade'
  , env: { 'NODE_ENV': 'development' }
  });
});
