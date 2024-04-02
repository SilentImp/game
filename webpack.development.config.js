const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  extends: path.resolve(__dirname, './webpack.config.js'),
  mode: 'development',
  devServer: {
    static: {
      directory: path.join(__dirname, 'docs'),
    },
    compress: true,
    port: 9000,
  },
  plugins: [
    new BundleAnalyzerPlugin({
      openAnalyzer: false,
    })
  ]
};