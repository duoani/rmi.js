var path = require('path');
var webpack = require('webpack');
var PATH = require('./config/PATH');

module.exports = {
  entry: {
    app: path.join(PATH.SRC, 'app.js'),
    test: path.join(PATH.SRC, 'test.js')
  },
  output: {
    path: path.join(PATH.DIST),
    publicPath: ''
  },
  resolve: {
    root: PATH.SRC,
    extensions: ['', '.js', '.json'],
    alias: {
      CSS: path.join(PATH.SRC, 'assets/css'),
      IMG: path.join(PATH.SRC, 'assets/images')
    }
  },
  resolveLoader: {
    root: path.join(__dirname, 'node_modules')
  },
  module: {
    loaders: [{
      test: /\.json$/,
      loader: 'json'
    }, {
      test: /\.(png|jpg|gif|svg)$/,
      loader: 'url',
      query: {
        limit: 1000000,
        name: '[name].[ext]?[hash]'
      }
    }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      // 配置开发全局常量
      __DEV__: process.env.NODE_ENV.trim() === 'development',
      __PROD__: process.env.NODE_ENV.trim() === 'production',
      __TEST__: process.env.NODE_ENV.trim() === 'test'
    })
  ]
};
