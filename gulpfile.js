var gulp = require('gulp');
var umd = require('gulp-umd');
var del = require('del');
var path = require('path');

gulp.task('clean', function () {
  return del(['dist']);
});

gulp.task('build', ['clean'], function () {
  return gulp.src('src/**/*.js')
    .pipe(umd({
      exports: function (file) {
        var name = path.basename(file.path, path.extname(file.path));
        return name;
      },
      namespace: function(file) {
        var name = path.basename(file.path, path.extname(file.path));
        return name;
      }
    }))
    .pipe(gulp.dest('dist'))
});

gulp.task('default', ['build']);
