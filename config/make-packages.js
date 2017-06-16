const fs = require('fs');
const path = require('path');
const promisify = require('util.promisify');
const pkg = require('../package.json');

const absolutify = rootPath => path.resolve(__dirname, '..', rootPath);

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const cjsPkg = Object.assign({}, pkg, {
  main: 'index.js',
  types: 'index.d.ts',
});

delete cjsPkg.scripts;

writeFile(absolutify('dist/cjs/package.json'), JSON.stringify(cjsPkg, null, 2));
readFile('LICENSE').then(data => writeFile(absolutify('dist/cjs/LICENSE'), data));
readFile('README.md').then(data => writeFile(absolutify('dist/cjs/README.md'), data));
