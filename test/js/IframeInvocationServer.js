var _id = 0;

function idGen () {
  return ++_id;
}

function Callback (resolve, reject) {
  this.resolve = resolve;
  this.reject = reject;
}

var CallbackStatus = {
  'OK': 0,
  'ERROR': 1
};

function IframeInvocationServer (bridge, invoker) {
  this._callbacks = {};
  this._bridge = bridge;
  this._invoker = invoker;
  bridge.pipe(this);
}

var proto = IframeInvocationServer.prototype;

proto.registerCallback = function (resolve, reject) {
  var id = idGen();
  this._callbacks[id] = new Callback(resolve, reject);
  return id;
};

/**
 * 请求对方API
 * @param {String} sourceId
 * @param {String} api api 名称
 * 从第三个参数开始为参数列表
 */
proto.invoke = function (sourceId, api) {
  // api 参数列表
  var params = Array.prototype.slice.call(arguments, 2);
  var me = this;
  return new Promise(function (resolve, reject) {
    var callbackId = me.registerCallback(resolve, reject);
    // 通过中继器向对方发送请求
    me._bridge.invoke(sourceId, callbackId, api, params);
  });
};

/**
 * 处理对方的请求，并回复
 * (约定：回复即调用对方的 handleCallback 接口)
 * @param {Array} command [callbackId:Number, api:String, params:Array]
 */
proto.handleInvocation = function (command) {
  var sourceId = command[0];
  var callbackId = command[1];
  var api = command[2];
  var params = command[3];

  var me = this;
  if (this._invoker) {
    this._invoker.invoke(api, params).then(function (res) {
      me._bridge.invokeCallback(sourceId, callbackId, CallbackStatus.OK, res);
    }, function (res) {
      me._bridge.invokeCallback(sourceId, callbackId, CallbackStatus.ERROR, res);
    });
  } else {
    me._bridge.invokeCallback(sourceId, callbackId, CallbackStatus.ERROR, 'No invoker binded');
  }
};

/**
 * 处理对方发来的回调信息
 * @param {Array} result [callbackId:Number, callbackStatus:Number, callbackData:Array]
 */
proto.handleCallback = function (results) {
  var callbackId = results[0];
  var callbackStatus = this.convertStatus(results[1]);
  var callbackData = results[2];
  var callbackContainer = this._callbacks[callbackId];

  if (!callbackContainer) {
    throw new Error('Unable to find matching callback object from calback id '
                    + callbackId);
  }

  switch (callbackStatus) {
  case CallbackStatus.OK:
    callbackContainer.resolve(callbackData);
    break;
  case CallbackStatus.ERROR:
    callbackContainer.reject(callbackData);
    break;
  }
  delete this._callbacks[callbackId];
};

proto.convertStatus = function (status) {
  switch (status) {
  case CallbackStatus.OK:
    return CallbackStatus.OK;

  case CallbackStatus.ERROR:
    return CallbackStatus.ERROR;

  default:
    throw new Error('Callback status string is not valid: ' + status);
  }
};

