
function MessageServer () {
  var me = this;
  me._clients = {};

  window.addEventListener('message', function (e) {
    var data = e.data;
    me.onReceive(data[0], data[1], data[2]);
  });
}

var proto = MessageServer.prototype;

/**
 * @param {String} clientId
 * @param {String} event
 * @param {Function} callback
 */
proto.on = function (clientId, event, callback) {
  var client = this._clients[clientId];
  if (!client) {
    client = this._clients[clientId] = {};
  }

  var cb = client[event];
  if (!cb) {
    cb = client[event] = [];
  }

  cb.push(callback);
};

proto.off = function (clientId, event) {
  var client = this._clients[clientId];
  if (!client) {
    return;
  }

  if (event !== undefined) {
    delete client[event];
  } else {
    delete this._clients[clientId];
  }
};

proto.send = function (clientId, event, message) {
  var msg = [event, [message]];
  var iframe = document.querySelector('#' + clientId);
  if (iframe) {
    iframe.contentWindow.postMessage(msg, '*');
  }
};

proto.onReceive = function (clientId, event, message) {
  var client = this._clients[clientId];
  if (!client) {
    return;
  }
  var cb = client[event];
  if (!cb) {
    return;
  }

  cb.forEach(function (callback) {
    callback.apply(null, message);
  });
};


var messager = new MessageServer();
messager.on('test-iframe', 'sourcemap-get', function (msg) {
  console.log('main frame receive a event: sourcemap-get: %s', msg)
  messager.send('test-iframe', 'sourcemap-receive', {
    files: ['index.js', 'index.css'],
    main: 'index.html'
  })
});
