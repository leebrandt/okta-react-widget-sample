'use strict';

const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const path = require('path');

module.exports = {
  context: __dirname + '/src',
  entry: {
    app: './app.js'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.LoaderOptionsPlugin({
      minimize: false,
      debug: true,
      noInfo: true, // set to false to see a list of every file being bundled.
      options: {
        sassLoader: {
          includePaths: [path.resolve(__dirname, 'scss')]
        },
        context: '/',
        postcss: () => [autoprefixer],
        historyApiFallback: {
          index: '/'
        }
      }
    })
  ],
  module: {
    rules: [
      {test: /\.jsx?$/, exclude: /node_modules/, loaders: ['babel-loader']},
      {test: /\.eot(\?v=\d+.\d+.\d+)?$/, loader: 'file-loader'},
      {test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url-loader?limit=10000&mimetype=application/font-woff'},
      {test: /\.[ot]tf(\?v=\d+.\d+.\d+)?$/, loader: 'url-loader?limit=10000&mimetype=application/octet-stream'},
      {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?limit=10000&mimetype=image/svg+xml'},
      {test: /\.(jpe?g|png|gif)$/i, loader: 'file-loader?name=[name].[ext]'},
      {test: /\.ico$/, loader: 'file-loader?name=[name].[ext]'},
      {test: /(\.css|\.scss|\.sass)$/, loaders: ['style-loader', 'css-loader?sourceMap', 'postcss-loader', 'sass-loader?sourceMap']}
    ]
  },
  output: {
    path: path.join(__dirname, 'src'),
    filename: '[name].bundle.js',
    publicPath: '/',
    sourceMapFilename: '[file].map'
  },
  devServer: {
    contentBase: path.join(__dirname, 'src'),
    port: 3000,
    filename: '[app].bundle.js',
    historyApiFallback: true
  }
};
