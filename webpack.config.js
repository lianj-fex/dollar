const chalk = require('chalk');
const webpack = require('webpack');
const WebpackNotifierPlugin = require('webpack-notifier');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const webpackMerge = require('webpack-merge');
const path = require('path')
const env = process.env.NODE_ENV;
const whiteList = [];

const plugins = [
  new WebpackNotifierPlugin(),
  new ProgressBarPlugin({
    format: `${chalk.black.bgBlueBright(' INFO ')} 正在进行构建 :bar ${chalk.green.bold(':percent')} (:elapsed 秒)`,
    clear: false,
    summary: false,
    complete: chalk.bgGreen(' '),
    incomplete: chalk.bgBlackBright(' '),
    customSummary: () => {}
  }),
  new FriendlyErrorsWebpackPlugin(),
  new webpack.optimize.ModuleConcatenationPlugin(),
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    }
  })
];
function asRegExp(test) {
  if(typeof test === "string") test = new RegExp("^" + test.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"));
  return test;
}

module.exports = [{
  devtool: '#source-map',
  target: 'web',
  output: {
    path: path.resolve('./dist'),
    filename: '[name].js'
  },
  entry: {
    '/web/index': './src/browser',
    '/web/emoji': './src/browser/emoji'
  },
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader',
      include: {test(str) {
        return !(/node_modules/.test(str)) || whiteList.some((r) => asRegExp(r).test(str))
      }}
    }]
  },
  plugins
}]