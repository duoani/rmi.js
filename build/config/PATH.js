var path = require('path');

var root = path.join(__dirname, '../../');
var src = path.join(root, '/src');
var dist = path.join(root, '/dist');

module.exports = {
  ROOT: root,
  DIST: dist,
  SRC: src,
  IMAGE: path.join(src, '/assets/images'),
  INDEX: path.join(src, '/index.html'),
  TEST: path.join(src, '/test.html'),
  RESOURCE_SRC: path.join(src, '/resource.json'),
  RESOURCE_DIST: path.join(dist, '/resource.json')
};
