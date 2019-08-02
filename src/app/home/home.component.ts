import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { DBDataService } from './dbdata.service';
import { QueryResults, ValueType } from 'sql.js';
import { ElectronService } from '../core/services';
import { NzTableComponent } from 'ng-zorro-antd';
import { fstat } from 'fs';

interface viewTypeInfo {
    table: string,
    filtes: string[]
}

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {

    @ViewChild('nzTable', { static: false }) nzTableComponent: NzTableComponent;
    constructor(private db: DBDataService, private es: ElectronService) { }

    loading = false;
    loaded = false;
    tabledata: { t: string, v: ValueType }[][] = [];
    viewdata = this.tabledata;
    filtes = new Map<string, ValueType[]>();

    pictrues: viewTypeInfo = {
        table: 'pictrues',
        filtes: ['name']
    };
    MyStor: viewTypeInfo = {
        table: 'MyStor',
        filtes: ['分类']
    };
    dbfilepath = '';
    viewname: viewTypeInfo = null;
    searchValue = "";

    // 加载数据库
    opendbdata(path: string) {
        this.viewname = path.endsWith('pic.db3') ? this.pictrues : path.endsWith('mystor.db') ? this.MyStor : null;
        if (this.viewname === null) {
            console.log('错误的数据文件');
            return;
        }
        this.dbfilepath = path;
        this.loading = true;

        this.db.loaddb(path, this.viewname.table, this.viewname.filtes).then(({ total, filteitems }) => {
            this.filtes = filteitems;
            const tabledata = total.values.map((v, i) => {
                v.unshift(i);
                return v.map(v2 => {
                    const typestr = typeof v2;
                    if (typestr === 'number' || typestr === 'string' || v2 == null) {
                        return { t: 'raw', v: v2 }
                    }
                    else {
                        const img = this.es.nativeImage.createFromBuffer(Buffer.from((v2 as Uint8Array).buffer));
                        return { t: 'img', v: img.toDataURL() };
                    }
                })
            });

            this.tabledata = tabledata;
            this.viewdata = this.tabledata;
            this.loading = false;
            this.loaded = true;
        });
    }


    ngOnInit() {

    }
    scrollToIndex(index: number): void {
        // this.nzTableComponent.cdkVirtualScrollViewport.scrollToIndex(index);
    }

    ngAfterViewInit(): void {
        // this.nzTableComponent.cdkVirtualScrollViewport.scrolledIndexChange
        //   .subscribe((data: number) => {
        //     console.log('scroll index to', data);
        //   });
    }
    trackByIndex(_: number, data): number {
        return data[0];
    }
    // 获取DB文件
    SelectDBFile() {
        this.es.remote.dialog.showOpenDialog({
            title: '选择数据文件',
            filters: [{ name: 'db文件', extensions: ['db', 'db3'] }]
        }).then(result => {
            if (result.filePaths.length !== 0) {
                this.opendbdata(result.filePaths[0]);
            }
        }).catch(err => {
            console.log(err);
        });

    }

}
