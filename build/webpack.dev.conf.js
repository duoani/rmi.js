var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlResWebpackPlugin = require('html-res-webpack-plugin');
var BrowserSyncPlugin = require('browser-sync-webpack-plugin');
var config = require('./webpack.base.conf');
var PATH = require('./config/PATH.js');

config.output.filename = '[name].js';
config.output.chunkFilename = '[id].js';

config.entry.app = [
  'webpack-hot-middleware/client?reload=true',
  'webpack/hot/only-dev-server',
  config.entry.app
];
config.entry.test = [
  'webpack-hot-middleware/client?reload=true',
  'webpack/hot/only-dev-server',
  config.entry.test
];

config.output.publicPath = '/';

// 开发环境下直接内嵌 CSS 以支持热替换
config.module.loaders.push({
  test: /\.css$/,
  loader: 'style!css'
});

config.plugins = (config.plugins || []).concat([
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoErrorsPlugin(),
  new ExtractTextPlugin('[name].css'),
  new HtmlResWebpackPlugin({
    filename: 'index.html',
    template: PATH.INDEX,
    chunks: {
      app: {
        inline: {
          js: true,
          css: true
        }
      }
    }
  }),
  new HtmlResWebpackPlugin({
    filename: 'test.html',
    template: PATH.TEST,
    chunks: {
      test: {
        inline: {
          js: true,
          css: true
        }
      }
    }
  }),
  new BrowserSyncPlugin({
    host: '127.0.0.1',
    port: 9090,
    proxy: 'http://127.0.0.1:9000/',
    logConnections: false,
    notify: false
  }, {
    reload: false
  })
]);

module.exports = config;

