var path = require('path');
var webpack = require('webpack');
var webpackMerge = require('webpack-merge');

var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

const ENV = process.env.NODE_ENV || 'production';

var commonConfig = {
  entry: {
    'vendor': [
      'babel-polyfill',
      'react',
      'react-dom',
      'react-emoji',
      'react-linkify',
      'react-redux',
      'react-responsive',
      'redux',
      'base64-js',
      'filesize',
      'js-binarypack',
      'msgpack-js',
      'strftime-component'
    ],
    'main': path.resolve('app/main.js')
  },

  output: {
    path: path.resolve('dist'),
    publicPath: '/',
    filename: 'bundle.js'
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: path.resolve('app'),
        loader: 'babel-loader',
        query: {
          plugins: [
              [ 'babel-root-import', { 'rootPathSuffix': 'app' } ],
              'transform-runtime'
          ],
          presets: [
            [ 'es2015', { 'modules': false } ],
            'react'
          ]
        }
      },
      {
        test: /\.html$/,
        loader: 'html-loader'
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract({
          fallbackLoader: 'style-loader',
          loader: [
            { loader: 'css-loader', options: { modules: true } },
            { loader: 'sass-loader'}
          ]
        })
      }
    ]
  },

  resolve: {
    extensions: [ '.js', '.jsx' ]
  },

  performance: {
    hints: false
  },

  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: 'vendor.bundle.js'
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(ENV)
    }),
    new HtmlWebpackPlugin({
      template: 'app/index.html',
      // favicon: 'app/favicon.ico'
    }),
    new ExtractTextPlugin('bundle.css')
  ]
};

var devConfig = {
  devtool: 'source-map',

  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.jsx?$/,
        loader: 'eslint-loader',
        exclude: /node_modules/
      }
    ]
  }
};

var prodConfig = {
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false }
    })
  ]
};

module.exports = webpackMerge(
  commonConfig,
  ENV === 'development' ? devConfig : prodConfig
);