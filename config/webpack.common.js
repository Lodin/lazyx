const webpack = require('webpack');
const paths = require('./paths');

const env = process.env.NODE_ENV;

const rxjsAbstraction = /rxjs\/(Observable|Subject)/;
const rxjsOperator = /^rxjs\/(?:operator|observable)\/(\w*)$/;

module.exports = {
  devtool: 'source-map',
  entry: [
    paths.index,
  ],
  resolve: {
    extensions: ['.js', '.json', '.ts', '.tsx'],
  },
  externals: [
    rxjsAbstraction,
    rxjsOperator,
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
