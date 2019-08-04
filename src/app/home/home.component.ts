import { Component, OnInit, ViewChild, AfterViewInit, EventEmitter } from '@angular/core';
import { DBDataService } from './dbdata.service';
import { ValueType } from 'sql.js';
import { ElectronService } from '../core/services';
import { NzTableComponent } from 'ng-zorro-antd';
import { ViewTypeInfo, pictrue, MyStor, TableEntry, ViewInfo } from './ViewInfo';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';



@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {
    currentPicIndex: number;
    videopath: string;


    constructor(private db: DBDataService, private es: ElectronService) {
    }

    @ViewChild('nzTable', { static: false }) nzTableComponent: NzTableComponent;


    loading = false;
    loaded = false;
    viewdata = new ViewInfo();
    viewList = [pictrue, MyStor];
    isListView = true;

    dbfilepath = '';
    imgpaths = [];
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
    ClickEntry(data: TableEntry) {
        let basepath = this.dbfilepath.split(/[\/\\]/);
        basepath = basepath.slice(0, basepath.length - 1);
        if (this.viewdata.viewType.detailView === 'img') {
            const filepath1 = (data.v[4].v as string).split(/[\/\\]/);
            const imgpath = [...basepath, ...filepath1];
            const shtml = [...imgpath, 'page_s.html'].join('/');
            const imgdir = imgpath.join('/');
            if (!this.isListView && this.es.fs.existsSync(shtml)) {
                window.open('file:' + shtml);
            }
            this.imgpaths = this.es.fs.readdirSync(imgdir).map(v => ['file://', imgdir, v].join('/'));
            this.currentPicIndex = 0;
        } else {
            this.imgpaths = [];
        }
        if (this.viewdata.viewType.detailView === 'video') {
            const storname = data.v[1].v;
            const ext = (data.v[2].v as string).split('.').pop();
            this.videopath = ['file://', ...basepath, 'store', storname[0], storname + '.' + ext].join('/');
        } else {
            this.videopath = '';
        }
    }
    onmousewheelOnPiclist(sender: CdkVirtualScrollViewport, $event: any) {
        const offset = $event.wheelDelta < 0 ? 1 : -1;
        this.currentPicIndex += offset;
        if (this.currentPicIndex < 0) { this.currentPicIndex = 0; }
        if (this.currentPicIndex >= this.imgpaths.length) { this.currentPicIndex = this.imgpaths.length - 1; }
        sender.scrollToIndex(this.currentPicIndex);
        $event.preventDefault();
    }
    test() {
        this.es.remote.dialog.showOpenDialog({}).then(result => {
            if (result.filePaths.length !== 0) {
                this.videopath = 'file://' + result.filePaths[0];
            }
        }).catch(err => {
            console.log(err);
        });
    }
    errorShow($event)
    {
        console.log($event);
    }

}
