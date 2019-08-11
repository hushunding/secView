import { Injectable } from '@angular/core';

import { ElectronService } from '../core/services';

// import * as initSqlJs from 'sql.js';
import { Database, QueryResults, ValueType } from 'sql.js';
import { FilterInfo } from './ViewInfo';
@Injectable({
  providedIn: 'root'
})
export class DBDataService {

  constructor(private es: ElectronService) {
  }

  loaddb(path: string, sqltbale: string, filtes: FilterInfo[]) {
    return new Promise<{ total: QueryResults}>((res, rej) => {
      const initSqlJs = this.es.remote.require('./sql.js');
      initSqlJs().then(
        (SQL) => {
          this.es.fs.readFile(path, (err, data) => {
            if (err) {
              rej(err);
            } else {
              const db: Database = new SQL.Database(data);
              const result = db.exec(`SELECT * FROM ${sqltbale}`);
              if (result.length > 0) {
                for (const f of filtes) {
                  const fres = db.exec(`SELECT ${f.name} FROM ${sqltbale} group by ${f.name}`);
                  f.filteritems = fres[0].values.map(v => v[0]);
                }
                const total = result[0];
                res({ total });
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
