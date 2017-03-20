;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.IframeBridge = factory();
  }
}(this, function() {
var IframeBridge = function (options) {
  this.options = Object.assign({
    targetOrigin: '*',
    sourceOrigin: null
  }, options);
};

IframeBridge.prototype.apply = function (req, res) {
  var targetOrigin = this.options.targetOrigin;
  var sourceOrigin = this.options.sourceOrigin;

  req(function (bridgeConfig, message) {
    var target = bridgeConfig.source || parent;

    if (target) {
      target.postMessage(message, targetOrigin);
    }
  });

  window.addEventListener('message', function (e) {
    // filter the e.origin
    if (sourceOrigin && e.origin !== sourceOrigin) {
      return;
    }

    /*
      e.data 的会有以下两种结构
      from invocation:
      [commandType:Number, sourceId:Number, callbackId:Number, api:String, params:Array]

      from callback:
      [commandType:Number, sourceId:Number, callbackId:Number, callbackStatus:Number, callbackData:Array]
    */
    var command = e.data;

    if (!command || !command.length) {
      return;
    }

    var bridgeConfig = {
      source: e.source
    };

    res(bridgeConfig, command);
  });
};

return IframeBridge;
}));
