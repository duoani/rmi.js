const TerserPlugin = require('terser-webpack-plugin')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')

module.exports = merge(baseWebpackConfig, {
  entry: {
    'rmi': './src/rmi.js'
  },
  output: {
    filename: '[name].js',
    library: 'rmi.js',
    libraryTarget: 'umd',
    globalObject: 'typeof self !== \'undefined\' ? self : this'
  },
  // externals: {
  //   vue: {
  //     amd: 'vue',
  //     root: 'Vue',
  //     commonjs: 'vue',
  //     commonjs2: 'vue'
  //   }
  // },
  optimization: {
    minimizer: [
      new TerserPlugin({
        sourceMap: true,
        terserOptions: {
          compress: {
            drop_console: true
          }
        }
      })
    ]
  }
})
