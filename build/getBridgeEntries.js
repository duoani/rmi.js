
// const path = require('path')
const glob = require('glob')
/**
* 动态查找所有入口文件
*/
module.exports = function getBridgeEntries () {
  var files = glob.sync('./src/bridge/**/*.js')
  var bridgeEntries = {}

  files.forEach(function(f) {
    var name = /.*\/(bridge\/.*?).js$/.exec(f)[1] // 得到 bridge/iframe/IframeBridge.js 这样的文件名
    bridgeEntries[name] = f
  })

  return bridgeEntries
}
