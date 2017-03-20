;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.IpcMainBridge = factory();
  }
}(this, function() {
const {ipcMain} = require('electron')

var IpcMainBridge = function (browserWindow, options) {
  this._win = browserWindow;
};

IpcMainBridge.prototype.apply = function (req, res) {
  var me = this;

  req(function (bridgeConfig, message) {
    var target = null;
    if (bridgeConfig.source) {
      target = bridgeConfig.source;
    } else if (bridgeConfig.targetId) {
      // The id of iframe element is assumed to be the value of targetId.
      target = me._win.webContents;
    }

    if (target) {
      target.send('ipc-bridge-message', message);
    }
  });

  ipcMain.on('ipc-bridge-message', function (e, command) {
    /*
      command 的会有以下两种结构
      from invocation:
        [commandType:Number, sourceId:Number, callbackId:Number, api:String, params:Array]

      from callback:
        [commandType:Number, sourceId:Number, callbackId:Number, callbackStatus:Number, callbackData:Array]
    */

    if (!command || !command.length) {
      return;
    }

    var bridgeConfig = {
      source: e.sender
    };

    res(bridgeConfig, command);
  });
};

module.exports = IpcMainBridge

return IpcMainBridge;
}));
