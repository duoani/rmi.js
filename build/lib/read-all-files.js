var path = require('path');
var fs = require('fs');

var defaults = {
  dirFilter: null,
  fileFilter: null
};

function readAllFiles(dir, options, callback) {
  if (typeof dir !== 'string') {
    throw new Error('dir is not given')
  }

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  options = Object.assign({}, defaults, options);

  var fileList = fs.readdirSync(dir);
  fileList.forEach(function (fileName) {
    var p = path.join(dir, fileName);
    var isDir = fs.statSync(p).isDirectory();
    if (isDir) {
      if (options.dirFilter) {
        options.dirFilter(p) !== false && readAllFiles(p, callback);
      } else {
        readAllFiles(p, callback);
      }
    } else if (callback) {
      if (options.fileFilter) {
        options.fileFilter(p) !== false && callback(p);
      } else {
        callback(p);
      }
    }
  })
}

module.exports = readAllFiles;

