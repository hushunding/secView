import { Component, OnInit, ViewChild, AfterViewInit, EventEmitter } from '@angular/core';
import { DBDataService } from './dbdata.service';
import { QueryResults, ValueType } from 'sql.js';
import { ElectronService } from '../core/services';
import { NzTableComponent } from 'ng-zorro-antd';
import { ViewTypeInfo, pictrue, MyStor, TableEntry, ViewInfo } from './ViewInfo';



@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {

    @ViewChild('nzTable', { static: false }) nzTableComponent: NzTableComponent;


    loading = false;
    loaded = false;
    viewdata = new ViewInfo();
    viewList = [pictrue, MyStor];

    dbfilepath = '';
    

    constructor(private db: DBDataService, private es: ElectronService) {
    }
    filterview(filtername: string, filer: ValueType[]) {
        const i = this.viewdata.columns.indexOf(filtername) + 1;
        this.viewdata.viewdata = this.viewdata.tabledata.filter((v) => filer.indexOf(v.v[i].v) >= 0);
    }
    // 加载数据库
    opendbdata(path: string) {
        const viewType = this.viewList.find((v: ViewTypeInfo) => path.endsWith(v.pattern));
        if (viewType === undefined) {
            console.log('错误的数据文件');
            return;
        }
        for (const f of viewType.filtes) {
            f.event.subscribe((fv: { name: string, array: ValueType[] }) => {
                if (fv.array.length === 0) {
                    this.viewdata.viewdata = this.viewdata.tabledata;
                } else {
                    this.filterview(fv.name, fv.array);
                }

            });
        }
        this.dbfilepath = path;
        this.loading = true;

        this.db.loaddb(path, viewType.table, viewType.filtes).then(({ total }) => {
            const tabledata = total.values.map((v, i) => {
                v.unshift(i);
                return {
                    v: v.map(v2 => this.dumpCellType(v2)), attr: {}
                };
            });
            this.viewdata = {
                viewdata: tabledata,
                tabledata,
                columns: total.columns,
                viewType
            };
            this.loading = false;
            this.loaded = true;
        });
    }
    dumpCellType(v2: ValueType) {
        const typestr = typeof v2;
        if (typestr === 'number' || typestr === 'string' || v2 == null) {
            return { t: 'raw', v: v2 };
        } else {
            const img = this.es.nativeImage.createFromBuffer(Buffer.from((v2 as Uint8Array).buffer));
            return { t: 'img', v: img.toDataURL() };
        }
    }

    ngOnInit() {

    }
    scrollToIndex(index: number): void {
        this.nzTableComponent.cdkVirtualScrollViewport.scrollToIndex(index);
    }

    ngAfterViewInit(): void {
        // this.nzTableComponent.cdkVirtualScrollViewport.scrolledIndexChange
        //   .subscribe((data: number) => {
        //     console.log('scroll index to', data);
        //   });
    }
    trackByIndex(_: number, data: TableEntry): number {
        return data.v[0].v as number;
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
