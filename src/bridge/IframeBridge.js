exports.mainframeBridge = {
  apply: function (req, res) {
    req(function (targetId, message) {
      // The id of iframe element is assumed to be the value of targetId.
      var iframe = document.querySelector('#' + targetId);
      if (iframe) {
        iframe.contentWindow.postMessage(message, '*');
      }
    });

    window.addEventListener('message', function (e) {
      // TODO filter the e.origin

      /*
        e.data 的会有以下两种结构
        [commandType:Number, sourceId:Number, callbackId:Number, api:String, params:Array]
        [commandType:Number, sourceId:Number, callbackId:Number, callbackStatus:Number, callbackData:Array]
      */
      var command = e.data;

      if (!command || !command.length) {
        return;
      }

      res(command);
    });
  }
};

exports.iframeBridge = {
  apply: function (req, res) {
    req(function (targetId, message) {
      parent.postMessage(message, '*');
    });

    window.addEventListener('message', function (e) {
      // TODO filter the e.origin

      /*
        e.data 的会有以下两种结构
        [commandType:Number, sourceId:Number, callbackId:Number, api:String, params:Array]
        [commandType:Number, sourceId:Number, callbackId:Number, callbackStatus:Number, callbackData:Array]
      */
      var command = e.data;

      if (!command || !command.length) {
        return;
      }

      res(command);
    });
  }
};
