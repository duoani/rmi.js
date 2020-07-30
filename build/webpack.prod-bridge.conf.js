const TerserPlugin = require('terser-webpack-plugin')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const getBridgeEntries = require('./getBridgeEntries')

const entry = getBridgeEntries()

module.exports = merge(baseWebpackConfig, {
  entry: entry,
  output: {
    filename: '[name].js'
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
