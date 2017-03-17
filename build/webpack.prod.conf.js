var webpack = require('webpack');
var rimraf = require('rimraf');
var config = require('./webpack.base.conf');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlResWebpackPlugin = require('html-res-webpack-plugin');

var PATH = require('./config/PATH');

rimraf.sync(PATH.DIST);

// naming output files with hashes for better caching.
// dist/index.html will be auto-generated with correct URLs.
config.output.filename = '[name].[chunkhash].js';
config.output.chunkFilename = '[id].[chunkhash].js';

config.module.loaders.push({
  test: /\.css$/,
  loader: ExtractTextPlugin.extract('style-loader', 'css-loader')
});

config.plugins = (config.plugins || []).concat([
  new webpack.optimize.DedupePlugin(),
  // new webpack.optimize.UglifyJsPlugin({
  //   compress: {
  //     warnings: false,
  //     drop_debugger: true,
  //     drop_console: true
  //   }
  // }),
  new webpack.optimize.OccurenceOrderPlugin(),
  // extract css into its own file
  new ExtractTextPlugin('[name].[contenthash].css'),
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
  })
  // new EntryManifestPlugin({
  //   filename: 'manifest.json'
  // })
]);

module.exports = config;



