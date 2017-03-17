var CommandType = {
  INVOCATION: 1, // 方法调用命令
  CALLBACK: 2    // 方法回调命令
};

function IframeBridge () {
  if (!(this instanceof IframeBridge)) {
    return new IframeBridge();
  }
}

var proto = IframeBridge.prototype;

/**
 * 向对方发送执行的命令
 * @param {String} targetId  要执行命令的模块 ID
 * @param {Number} callbackId 回调 ID
 * @param {String} api API 方法名
 * @param {Array} params 传入 api 的方法列表
 */
proto.invoke = function (targetId, callbackId, api, params) {
  // 添加命令类型及调用来源
  var command = [
    CommandType.INVOCATION,
    callbackId,
    api,
    params
  ];
  this._send(targetId, command);
};

/**
 * 向对方发送回调信息
 * @param {String} targetId  要执行命令的模块 ID
 * @param {Number} callbackId 回调 ID
 * @param {Number} callbackStatus
 * @param {Array} callbackData
 */
proto.invokeCallback = function (targetId, callbackId, callbackStatus, callbackData) {
  // 添加命令类型及调用来源
  var command = [
    CommandType.CALLBACK,
    callbackId,
    callbackStatus,
    callbackData
  ];
  this._send(targetId, command);
};

/**
 * 发送消息到 iframe
 */
proto._send = function (targetId, message) {
  var iframe = document.querySelector('#' + targetId);
  if (iframe) {
    iframe.contentWindow.postMessage(message, '*');
  }
};

/**
 * 将接收到的消息转接到给定的 invocation
 * @param {Invocation} invocation
 */
proto.pipe = function (invocation) {
  window.addEventListener('message', function (e) {
    /*
      e.data 的会有以下两种结构
      [commandType:Number, sourceId:Number, callbackId:Number, api:String, params:Array]
      [commandType:Number, sourceId:Number, callbackId:Number, callbackStatus:Number, callbackData:Array]
    */
    var command = e.data;

    if (!command || !command.length) {
      return;
    }

    var commandType = command.shift();

    if (commandType === CommandType.INVOCATION) {
      invocation.handleInvocation(command);
    } else if (commandType === CommandType.CALLBACK) {
      // 去掉 sourceId
      command.shift();
      invocation.handleCallback(command);
    }
  });
};
