var path = require('path');
var fs = require('fs');
var readAllFiles = require('./read-all-files');

var fileReg = /\.(jpg|jpeg|png|gif|bmp)/i;

function fileFilter(dir) {
  return fileReg.test(dir);
}

function base64Images(dir, relativeDir) {
  var map = {};
  relativeDir = relativeDir ? relativeDir : dir;
  readAllFiles(dir, {fileFilter: fileFilter}, function (src) {
    var extname = path.extname(src).substr(1);
    var fileKey = path.relative(relativeDir, src);
    var base64Str = fs.readFileSync(src).toString('base64');
    map[fileKey] = `data:image/${extname};base64,${base64Str}`;
  });
  return map;
}

module.exports = base64Images;

