var gulp = require('gulp')
  , hint = require('gulp-jshint')
  , uglify = require('gulp-uglify')
  , browserify = require('gulp-browserify')
  , stylus = require('gulp-stylus')
  , stylish = require('jshint-stylish')
  , gutil = require('gulp-util')
  , nodemon = require('gulp-nodemon')
  , util = require('util')
  

//TODO add the other paths and use them
var paths = {
  noChangeAssets: [
    'src/public/img/*.*',
    'src/public/css/*.css',
    'src/public/fonts/*.*',
    'src/public/third/*.*'
  ]
}

var hintOpts = {
  maxerr: 8,
  devel: true,
  indent: 2,
  newcap: true,
  noarg: true,
  noempty: true,
  quotmark: true,
  undef: true,
  unused: true,
  trailing: true,
  maxlen: 80,
  expr: true,
  loopfunc: true,
  bitwise: true,
  laxcomma: true,
  laxbreak: true,
  nonbsp: true,
  asi: true,
  esversion: 6
};

var hintServerOpts = {
  node: true
};

var hintBrowserOpts = {
  browser: true,
  node: true
};

util._extend(hintServerOpts, hintOpts);
util._extend(hintBrowserOpts, hintOpts);


var onError = function (err) {
  gutil.beep();
  console.log(err.toString());
  this.emit('end');
};


/**
 * Copy assets that need not processing
 */
gulp.task('copy', function(){
  return gulp.src(paths.noChangeAssets, {base: 'src/public/'})
             .pipe(gulp.dest('./build'));
});


gulp.task('stylus', function () {
  return gulp.src('src/public/css/*.styl')
             .pipe(stylus())
             .pipe(gulp.dest('build/css'));
});


gulp.task('hintServer', function () {
  return gulp.src([
      'src/server/**/*.js',
      'app.js',
      'gulpfile.js',
    ])
    .pipe(hint(hintServerOpts))
    .pipe(hint.reporter(stylish))
    .pipe(hint.reporter('fail'))
    .on('error', onError);
});


gulp.task('hintPublic', function () {
  return gulp.src([
      'src/public/**/*.js',
      'src/shared/**/*.js'
    ])
    .pipe(hint(hintBrowserOpts))
    .pipe(hint.reporter(stylish))
    .pipe(hint.reporter('fail'))
    .on('error', onError);
});


gulp.task('browserify', function () {
  gulp.src('src/public/js/app.js')
      .pipe(browserify({
        insertGlobals: true,
        debug: !gulp.env.production
      }))
      .pipe(gulp.dest('build/js'));
});


gulp.task('compress', function () {
  return gulp.src('build/js/*.js')
    .pipe(uglify({
      compress: {
        drop_console: true
      }
    }))
    .pipe(gulp.dest('build/js'));
});


gulp.task('nodemon', function(){
  return nodemon({
    script: 'app.js',
    env: {
      PORT: process.env.PORT || 3000
    },
    watch: [
      'src/config'
    , 'src/app.js'
    , 'src/controllers/*.js'
    , 'src/models/*.js'
    , 'src/plugins/*.js'
    , 'src/game/*.js'
    , 'secrets.js'
    ]
  })
});


gulp.task('watch', function() {
  gulp.watch('src/public/js/app.js', ['browserify']);
  gulp.watch('src/public/js/**/*.js', ['browserify']);
  gulp.watch('src/public/css/*.styl', ['stylus']);
  gulp.watch('src/server/**/*.js', ['hintServer']);
});


gulp.task('default',
          [
            'copy',
            'stylus',
            'browserify',
            'nodemon',
            'hintServer',
            'hintPublic',
            'watch'
          ]);


gulp.task('deploy',
          [
            'copy',
            'stylus',
            'browserify',
            'hintServer',
            'hintPublic',
          ]);

