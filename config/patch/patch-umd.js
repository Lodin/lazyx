const fs = require('fs');
const path = require('path');
const promisify = require('util.promisify');

const absolutify = rootPath => path.resolve(__dirname, '../..', rootPath);

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const umdRequireAbstraction = /\["rxjs\/(Observable|Subject)"\]/g;
const umdRequireObservable = /\["rxjs\/observable\/(\w*)"\]/g;
const umdRequireOperator = /\["rxjs\/operator\/(\w*)"\]/g;

const regularUmdPath = absolutify('dist/umd/lazyx.js');
const minifiedUmdPath = absolutify('dist/umd/lazyx.min.js');

const replaceUmdRequire = umdPath =>
  readFile(umdPath)
    .then((data) => {
      const replaced = data.toString()
        .replace(umdRequireAbstraction, (_, abstraction) => `["Rx"].${abstraction}`)
        .replace(umdRequireObservable, (_, staticOperator) => `["Rx"].Observable.${staticOperator}`)
        .replace(umdRequireOperator, (_, operator) => `["Rx"].Observable.prototype.${operator}`);
      writeFile(umdPath, replaced);
    })
    .catch((err) => {
      throw err;
    });

replaceUmdRequire(regularUmdPath);
replaceUmdRequire(minifiedUmdPath);
