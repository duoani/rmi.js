'use strict'
const chalk = require('chalk')
const webpack = require('webpack')
const webpackConfig = require('./webpack.prod-bridge.conf')

webpack(webpackConfig, (err, stats) => {
  if (err) throw err
  process.stdout.write(
    stats.toString({
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false
    }) + '\n\n'
  )

  if (stats.hasErrors()) {
    console.log(chalk.red(' Build failed with errors.\n'))
    process.exit(1)
  }

  console.log(chalk.cyan(' Build bridges complete.\n'))
})
