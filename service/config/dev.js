'use strict'

const { merge } = require('webpack-merge')

const baseWebpackConfig = require('./base')
const cssWebpackConfig = require('./css')
const config = require('../project.config')

module.exports = merge(baseWebpackConfig, cssWebpackConfig, {
  mode: 'development',
  devtool: false, // new 07/27/23
  devServer: {
    historyApiFallback: {
      rewrites: [{ from: /./, to: '/index.html' }],
    },
    devMiddleware: {
      publicPath: config.dev.publicPath,
    },
    open: false,
    host: '0.0.0.0',
    port: config.dev.port,
    liveReload: false,
  },

  infrastructureLogging: {
    level: 'warn',
  },

  stats: {
    assets: true, // new 07/27/23
    modules: true, // new 07/27/23
  },
})
