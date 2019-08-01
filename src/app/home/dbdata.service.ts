import { Injectable } from '@angular/core';

import { ElectronService } from '../core/services';

// import * as initSqlJs from 'sql.js';
import { Database, QueryResults } from 'sql.js';
@Injectable({
  providedIn: 'root'
})
export class DBDataService {

  constructor(private es: ElectronService) {
  }


  loaddb(path: string, sqltbale:string) {
    return new Promise<QueryResults>((res, rej) => {
      const initSqlJs = this.es.remote.require('sql.js');
      initSqlJs().then(
        (SQL) => {
          this.es.fs.readFile(path, (err, data) => {
            if (err) {
              rej(err);
            } else {
              const db: Database = new SQL.Database(data);
              const result = db.exec(`SELECT * FROM ${sqltbale}`);
              if (result.length > 0) {
                res(result[0]);
              } else {
                rej('no data');
              }
            }
          });
        },
        () => {
          rej('SQL未加载');
        });
    });
  }
}
