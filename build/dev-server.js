var express = require('express');
var webpack = require('webpack');
var webpackDevMiddleware = require('webpack-dev-middleware');
var webpackHotMiddleware = require('webpack-hot-middleware');
var config = require('./webpack.dev.conf');
var app = express();

var compiler = webpack(config);

app.use(webpackDevMiddleware(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath
}));

app.use(webpackHotMiddleware(compiler));

app.listen(9000, '127.0.0.1', function (err) {
  if (err) {
    console.log(err);
    return;
  }
  console.log('Listening on http://127.0.0.1:9000');
});
