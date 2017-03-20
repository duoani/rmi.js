;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.rmi = factory();
  }
}(this, function() {
var toStr = Object.prototype.toString;

var isObject = function (o) {
  return toStr.call(o) === '[object Object]';
};

var isString = function (o) {
  return toStr.call(o) === '[object String]';
};

var isFunction = function (o) {
  return toStr.call(o) === '[object Function]';
};

var idGen = (function (id) {
  return function () {
    return ++id;
  };
})(0);

var CommandType = {
  INVOCATION: 'INVOCATION', // 方法调用命令
  CALLBACK: 'CALLBACK'    // 方法回调命令
};

var CallbackStatus = {
  'OK': 'OK',
  'ERROR': 'ERROR'
};

function convertStatus (status) {
  switch (status) {
  case CallbackStatus.OK:
    return CallbackStatus.OK;

  case CallbackStatus.ERROR:
    return CallbackStatus.ERROR;

  default:
    throw new Error('CallbackContainer status string is not valid: ' + status);
  }
};

function CallbackContainer (resolve, reject) {
  this.resolve = resolve;
  this.reject = reject;
}

function Api (methodMap) {
  this._map = methodMap || {};
}

Api.prototype.add = function (methodName, impl) {
  this._map[methodName] = impl;
};

Api.prototype.invoke = function (methodName, params) {
  if (!this._map[methodName]) {
    return Promise.reject('Unable to find matching api ' + methodName);
  }
  return this._map[methodName].apply(this._map, params);
};

function Invocation (id, api) {
  this._id = id;
  this._callbacks = {};
  this._api = new Api(api);
  this._request = null;
}

// 添加 API
Invocation.prototype.addApi = function (method, impl) {
  if (isObject(method)) {
    for (var k in method) {
      isFunction(method[k]) && this._api.add(k, method[k]);
    }
  } else if (isString(method) && isFunction(impl)) {
    this._api.add(method, impl);
  }
  return this;
};

Invocation.prototype.pipe = function (bridge) {
  bridge.apply(this._pipeRequest.bind(this), this._onResponse.bind(this));
};

Invocation.prototype.registerCallback = function (resolve, reject) {
  var id = idGen();
  this._callbacks[id] = new CallbackContainer(resolve, reject);
  return id;
};

/**
 * 请求对方API
 * @param {String} targetId
 * @param {String} api api 名称
 * 从第三个参数开始为参数列表
 */
Invocation.prototype.invoke = function (targetId, api) {
  // api 参数列表
  var params = Array.prototype.slice.call(arguments, 2);
  var me = this;
  return new Promise(function (resolve, reject) {
    var callbackId = me.registerCallback(resolve, reject);
    // 通过中继器向对方发送请求
    var bridgeConfig = {
      targetId: targetId
    };
    me.sendInvocation(bridgeConfig, callbackId, api, params);
  });
};

/**
 * 处理对方的请求，并回复
 * (约定：回复即调用对方的 handleCallback 接口)
 * @param {Array} command [callbackId:Number, api:String, params:Array]
 */
Invocation.prototype.handleInvocation = function (bridgeConfig, command) {
  var sourceId = command[0];
  var callbackId = command[1];
  var api = command[2];
  var params = command[3];

  // 回路
  bridgeConfig.targetId = sourceId;

  var me = this;
  if (this._api) {
    this._api.invoke(api, params).then(function (res) {
      me.sendCallback(bridgeConfig, callbackId, CallbackStatus.OK, res);
    }, function (res) {
      me.sendCallback(bridgeConfig, callbackId, CallbackStatus.ERROR, res);
    });
  } else {
    me.sendCallback(bridgeConfig, callbackId, CallbackStatus.ERROR, 'No invoker binded');
  }
};

/**
 * 处理对方发来的回调信息
 * @param {Array} result [callbackId:Number, callbackStatus:Number, callbackData:Array]
 */
Invocation.prototype.handleCallback = function (results) {
  var callbackId = results[0];
  var callbackStatus = convertStatus(results[1]);
  var callbackData = results[2];
  var callbackContainer = this._callbacks[callbackId];

  if (!callbackContainer) {
    throw new Error('Unable to find matching callback object from calback id ' + callbackId);
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

/**
 * 向对方发送执行的命令
 * @param {String} targetId  要执行命令的模块 ID
 * @param {Number} callbackId 回调 ID
 * @param {String} api API 方法名
 * @param {Array} params 传入 api 的方法列表
 */
Invocation.prototype.sendInvocation = function (bridgeConfig, callbackId, api, params) {
  // 添加命令类型及调用来源
  var command = [
    CommandType.INVOCATION,
    this._id,
    callbackId,
    api,
    params
  ];
  this._send(bridgeConfig, command);
};

/**
 * 向对方发送回调信息
 * @param {String} targetId  要执行命令的模块 ID
 * @param {Number} callbackId 回调 ID
 * @param {Number} callbackStatus
 * @param {Array} callbackData
 */
Invocation.prototype.sendCallback = function (bridgeConfig, callbackId, callbackStatus, callbackData) {
  // 添加命令类型及调用来源
  var command = [
    CommandType.CALLBACK,
    this._id,
    callbackId,
    callbackStatus,
    callbackData
  ];

  this._send(bridgeConfig, command);
};

/**
 * 发送消息到 iframe
 */
Invocation.prototype._send = function (bridgeConfig, message) {
  this._request(bridgeConfig, message);
};

Invocation.prototype._pipeRequest = function (request) {
  this._request = request;
};

/**
 * 将接收到的消息转接到对应的处理方法
 * command 会有以下两种结构
 * [commandType:Number, sourceId:Number, callbackId:Number, api:String, params:Array]
 * [commandType:Number, sourceId:Number, callbackId:Number, callbackStatus:Number, callbackData:Array]
 */
Invocation.prototype._onResponse = function (bridgeConfig, command) {
  var commandType = command.shift();

  if (commandType === CommandType.INVOCATION) {
    this.handleInvocation(bridgeConfig, command);

  } else if (commandType === CommandType.CALLBACK) {
    // The sourceId is unnecessary for callback
    command.shift();
    this.handleCallback(command);
  }
};

var rmi = {
  create: function (id, api) {
    return new Invocation(id, api);
  }
};

return rmi;
}));
