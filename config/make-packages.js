const fs = require('fs');
const path = require('path');
const promisify = require('util.promisify');

const absolutify = rootPath => path.resolve(__dirname, '..', rootPath);

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

(async function makePackages(pkg) {
  const cjsPkg = Object.assign({}, pkg, {
    main: 'index.js',
    types: 'index.d.ts',
  });

  delete cjsPkg.scripts;

  writeFile(absolutify('dist/cjs/package.json'), JSON.stringify(cjsPkg, null, 2));
  writeFile(absolutify('dist/cjs/LICENSE'), await readFile('LICENSE'));
  writeFile(absolutify('dist/cjs/README.md'), await readFile('README.md'));
}(require('../package.json')));
