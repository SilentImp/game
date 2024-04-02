const path = require('path');

module.exports = {
  extends: path.resolve(__dirname, './webpack.config.js'),
  mode: 'production',
  optimization: {
    minimize: false,
  },
  devServer: {
    allowedHosts: 'all',
    static: {
      directory: path.join(__dirname, 'public'),
    },
    client: {
      overlay: true,
    },
    compress: true,
    port: 9000,
  },
};