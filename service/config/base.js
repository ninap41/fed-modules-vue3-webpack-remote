'use strict'

const { DefinePlugin, SourceMapDevToolPlugin } = require('webpack')
const { VueLoaderPlugin } = require('vue-loader')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const ESLintPlugin = require('eslint-webpack-plugin')
const HTMLPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')

const resolveClientEnv = require('../utils/resolveClientEnv')
const paths = require('../utils/paths')
const { ModuleFederationPlugin } = require('webpack').container

const config = require('../project.config')

// const isProd = process.env.NODE_ENV === 'production' 
const isProd = true // new 07/27/23

const dependencies = require('../../package.json').dependencies // new
// https://github.com/akxcv/vuera
module.exports = {
  context: process.cwd(),
  experiments: {
    outputModule: true, // new 07/27/23
  },

  entry: {
    app: './src/main.ts',
  },
  optimization: { runtimeChunk: false },
  output: {
    path: paths.resolve(config.outputDir),
    publicPath: 'http://localhost:8080/',
    filename: '[name][contenthash].js',
    clean: true,
  },

  resolve: {
    alias: {
      '@': paths.resolve('src'),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.vue', '.json'],
  },

  plugins: [
    new ModuleFederationPlugin({
      name: 'Remote',
      // library: { type: 'var', name: 'Remote' },
      filename: 'remoteEntry.js',
      exposes: {
        './Test': './src/components/TestComponent',
      },

      shared: {
        react: {
          singleton: true,
          requiredVersion: '^18.2.0',
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^18.2.0',
        },
        'react-router-dom': {
          singleton: true,
          requiredVersion: '^6.3.0',
        },

        vue: {
          singleton: true,
          strictVersion: false,
          requiredVersion: dependencies['vue'], // new// new
          eager: true,
        },
      },
    }),

    new ESLintPlugin({
      emitError: true,
      emitWarning: true,
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.vue'],
      formatter: require('eslint-formatter-friendly'),
    }),
    new VueLoaderPlugin(),
    new CaseSensitivePathsPlugin(),
    new HTMLPlugin({
      template: paths.resolve('public/index.html'),
      templateParameters: {
        ...resolveClientEnv(
          { publicPath: isProd ? config.build.publicPath : config.dev.publicPath },
          true /* raw */
        ),
      },
    }),
    new CopyPlugin({
      patterns: [
        {
          from: paths.resolve('public'),
          toType: 'dir',
          globOptions: {
            ignore: ['.DS_Store', '**/index.html'],
          },
          noErrorOnMissing: true,
        },
      ],
    }),
    new DefinePlugin({
      // vue3 feature flags <http://link.vuejs.org/feature-flags>
      __VUE_OPTIONS_API__: 'true',
      __VUE_PROD_DEVTOOLS__: 'false',

      ...resolveClientEnv({
        publicPath: isProd ? config.build.publicPath : config.dev.publicPath,
      }),
    }),
  ],

  module: {
    noParse: /^(vue|vue-router|pinia)$/,

    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },

      // babel
      {
        test: /\.m?jsx?$/,
        exclude: (file) => {
          // always transpile js in vue files
          if (/\.vue\.jsx?$/.test(file)) {
            return false
          }
          // Don't transpile node_modules
          return /node_modules/.test(file)
        },
        use: ['thread-loader', 'babel-loader'],
      },

      // ts
      {
        test: /\.tsx?$/,
        use: [
          'thread-loader',
          'babel-loader',
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              appendTsSuffixTo: ['\\.vue$'],
              happyPackMode: true,
            },
          },
        ],
      },

      // images
      {
        test: /\.(png|jpe?g|gif|webp)(\?.*)?$/,
        type: 'asset',
        generator: { filename: 'img/[contenthash:8][ext][query]' },
      },

      // do not base64-inline SVGs.
      // https://github.com/facebookincubator/create-react-app/pull/1180
      {
        test: /\.(svg)(\?.*)?$/,
        type: 'asset/resource',
        generator: { filename: 'img/[contenthash:8][ext][query]' },
      },

      // media
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        type: 'asset',
        generator: { filename: 'media/[contenthash:8][ext][query]' },
      },

      // fonts
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i,
        type: 'asset',
        generator: { filename: 'fonts/[contenthash:8][ext][query]' },
      },
    ],
  },
}
