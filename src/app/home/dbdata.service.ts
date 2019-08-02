import { Injectable } from '@angular/core';

import { ElectronService } from '../core/services';

// import * as initSqlJs from 'sql.js';
import { Database, QueryResults, ValueType } from 'sql.js';
@Injectable({
  providedIn: 'root'
})
export class DBDataService {

  constructor(private es: ElectronService) {
  }


  loaddb(path: string, sqltbale: string, filtes: string[]) {
    return new Promise<{ total: QueryResults, filteitems: Map<string, ValueType[]> }>((res, rej) => {
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
                const filteitems = new Map<string, ValueType[]>();
                for (const f of filtes) {
                  const fres = db.exec(`SELECT ${f} FROM ${sqltbale} group by ${f}`);
                  filteitems.set(f, fres[0].values.map(v => v[0]));
                }
                const total = result[0]
                res({ total, filteitems });
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
