const webpack = require('webpack');
const paths = require('./paths');

const env = process.env.NODE_ENV;

module.exports = {
  devtool: 'source-map',
  entry: [
    paths.index,
  ],
  output: {
    library: 'Lazyx',
    libraryTarget: 'umd',
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env),
    }),
  ],
};