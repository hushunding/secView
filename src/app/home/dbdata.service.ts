import { Injectable } from '@angular/core';

import { ElectronService } from '../core/services';

// import * as initSqlJs from 'sql.js';
// import 'sql.js';
@Injectable({
  providedIn: 'root'
})
export class DBDataService {

  constructor(private es: ElectronService) {
  }


  loaddb(path: string) {
    return new Promise((res, rej) => {
      const initSqlJs = this.es.remote.require('sql.js');
      initSqlJs().then(
        (SQL) => {
          this.es.fs.readFile(path, (err, data) => {
            if (err) {
              rej(err);
            } else {
              const db = new SQL.Database(data);
              const result = db.exec(`SELECT * FROM "MyStor"`);
              res(result);
            }
          });
        },
        () => {
          rej('SQL未加载');
        });
    });
  }
}
