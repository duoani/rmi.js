var gulp = require('gulp');
var umd = require('gulp-umd');
var del = require('del');
var path = require('path');

gulp.task('clean', function () {
  return del(['dist']);
});

gulp.task('build', ['clean'], function () {
  return gulp.src('src/**/*.js')
    .pipe(umd())
    .pipe(gulp.dest('dist'))
});
