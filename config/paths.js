const path = require('path');

const resolve = way => path.resolve(__dirname, '..', way);

module.exports = {
  build: resolve('./umd'),
  cache: resolve('./node_modules/.cache'),
  index: resolve('./src/index.ts'),
  modules: resolve('./node_modules'),
  src: resolve('./src'),
  tsconfig: resolve('./tsconfig.json'),
};
