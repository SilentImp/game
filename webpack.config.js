const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const path = require('path');

module.exports = {
  target: 'web',
  entry: './src/game.js',
  experiments:{
    asyncWebAssembly: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, 'docs'),
    filename: 'assets/javascript/game.js',
    wasmLoading: 'fetch',
    workerWasmLoading: 'fetch',
    asyncChunks: true,
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new HtmlWebpackPlugin({
      filename: './index.html',
      template: './index.html'
    }),
    new CopyPlugin({
      patterns: [
        { from: "assets/css/*", to: "." },
      ],
    }),
  ],
};