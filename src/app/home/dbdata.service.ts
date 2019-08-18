import { Injectable } from '@angular/core';

import { ElectronService } from '../core/services';

import * as initSqlJs from 'sql.js';
import { FilterInfo } from './ViewInfo';
import { SqlJs } from 'sql.js/module';
@Injectable({
    providedIn: 'root'
})
export class DBDataService {
    SQL: SqlJs.SqlJsStatic = null;
    SQLErr = 'SQL未加载';

    constructor(private es: ElectronService) {
        // const initSqlJs = this.es.remote.require('./sql.js') as SqlJs.InitSqlJsStatic;
        initSqlJs().then(
            (SQL) => {
                this.SQL = SQL;
                this.SQLErr = '';
            });
    }

    loaddb(path: string, sqltbale: string, filtes: FilterInfo[]) {
        return new Promise<{ total: SqlJs.QueryResults }>((res, rej) => {
            this.es.fs.readFile(path, (err, data) => {
                if (err) {
                    this.SQLErr = err.message;
                    rej(err);
                } else {
                    const db = new this.SQL.Database(data);
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

        });
    }
}
