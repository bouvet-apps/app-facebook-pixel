const merge = require('webpack-merge');
const common = require('./webpack.common.config');

module.exports = merge(common, {
  mode: 'development',
  entry: {
    main: './scripts/main.jsx'
  },
  devtool: 'inline-source-map'
});
