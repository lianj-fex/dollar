const chalk = require('chalk');
const webpack = require('webpack');
const WebpackNotifierPlugin = require('webpack-notifier');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const merge = require('webpack-merge');
const path = require('path')
const whiteList = [];

function asRegExp(test) {
  if(typeof test === "string") test = new RegExp("^" + test.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"));
  return test;
}


let baseConfig = {
  // devtool: '#source-map',
  output: {
    path: path.resolve('./dist'),
    filename: '[name].js'
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
  plugins: [
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
    new webpack.optimize.ModuleConcatenationPlugin()
  ]
};

module.exports = [merge(baseConfig, {
  target: 'web',
  entry: {
    '/web/index': './src/entry/web',
    '/web/emoji': './src/entry/web/emoji'
  },
  plugins: [new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    }
  })]
}), merge(baseConfig, {
  target: 'node',
  output: {
    libraryTarget: 'commonjs2'
  },
  entry: {
    '/node/index': './src/entry/node'
  }
})];