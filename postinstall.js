// Allow angular using electron module (native node modules)
const fs = require('fs');
const path = require('path');
const f_angular = 'node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs/browser.js';

fs.readFile(f_angular, 'utf8', function (err, data) {
  if (err) {
    return console.log(err);
  }
  var result = data.replace(/target: "electron-renderer",/g, '');
  var result = result.replace(/target: "web",/g, '');
  var result = result.replace(/return \{/g, 'return {target: "electron-renderer",');

  fs.writeFile(f_angular, result, 'utf8', function (err) {
    if (err) return console.log(err);
  });
});

const sqljs = 'node_modules/sql.js/package.json';

(async ()=>{
    const data = await fs.promises.readFile(sqljs, {encoding:'utf8'});
    const main = JSON.parse(data).main
    const srcjs = path.join(path.dirname(sqljs), main);
    const wasm = path.join(path.dirname(srcjs), 'sql-wasm.wasm');
    await fs.promises.copyFile(srcjs, './sql.js')
    await fs.promises.copyFile(wasm, `./sql-wasm.wasm`)
})().catch(err=>{
  console.log(err)
})