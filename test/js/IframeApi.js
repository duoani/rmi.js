function IframeApi (methodMap) {
  this._map = methodMap || {};
}

var proto = IframeApi.prototype;

proto.invoke = function (method, params) {
  if (!this._map[method]) {
    return Promise.reject('Unable to find matching api ' + method);
  }
  return this._map[method](params);
};
