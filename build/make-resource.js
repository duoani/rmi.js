var fs = require('fs');
var base64Images = require('./lib/base64-images');
var PATH = require('./config/PATH');

var imageMap = base64Images(PATH.IMAGE);
console.log('Read resource from: %s', PATH.RESOURCE_SRC);

fs.readFile(PATH.RESOURCE_SRC, function (e, file) {
  if (e) {
    throw e;
  }

  var resourceJSON = null;
  try {
    resourceJSON = JSON.parse(file.toString());
  } catch (e) {
    throw new Error(`Resource [${PATH.RESOURCE_MAP}] parse error.\n ${e.stack}`);
  }

  resourceJSON.images = imageMap;
  updateResourceFile(resourceJSON);
});

function updateResourceFile(map) {
  fs.writeFile(PATH.RESOURCE_DIST, JSON.stringify(map, null, 2));
  console.log('Write resource to: %s', PATH.RESOURCE_DIST);
  console.log('Resource build success.');
}


