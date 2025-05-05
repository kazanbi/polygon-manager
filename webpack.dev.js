// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: CC0-1.0

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'webcomp-boilerplate.js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  devServer: {
    static: './public',
    port: 8986,
    hot: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html'
    }),
  ],
  devtool: 'inline-source-map',
};
