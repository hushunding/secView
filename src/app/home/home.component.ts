import { Component, OnInit, ViewChild, AfterViewInit, EventEmitter } from '@angular/core';
import { DBDataService } from './dbdata.service';
import { ElectronService } from '../core/services';
import { NzTableComponent, NzMessageService } from 'ng-zorro-antd';
import { ViewTypeInfo, pictrue, MyStor, TableEntry, ViewInfo, ValueType } from './ViewInfo';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';



@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {
    currentPicIndex: number;
    videopath: string;
    videosize = 512;
    currfindIndex = 0;
    showtitle: ValueType;
    userExterntools = false;


    constructor(private db: DBDataService, private es: ElectronService, private message: NzMessageService) {
    }

    @ViewChild('nzTable', { static: false }) nzTableComponent: NzTableComponent;


    loading = false;
    loaded = false;
    viewdata = new ViewInfo();
    viewList = [pictrue, MyStor];
    isListView = true;
    get dbErr() {
        return this.db.SQLErr;
    }

    dbfilepath = '';
    imgpaths: string[] = [];
    filterview(filtername: string, filer: ValueType[]) {
        const i = this.viewdata.columns.indexOf(filtername);
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
                columns: ['Index', ...total.columns],
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
            filters: [{ name: 'db文件', extensions: ['db', 'db3'] }],
            defaultPath: process.cwd()
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
            this.showtitle = data.v[3].v;
            const filepath1 = (data.v[4].v as string).split(/[\/\\]/);
            const imgpath = [...basepath, ...filepath1];
            const shtml = [...imgpath, 'page_s.html'].join('/');
            const imgdir = imgpath.join('/');
            if (!this.isListView && this.es.fs.existsSync(shtml)) {
                window.open('file:' + shtml);
            }
            const filelist = this.es.fs.readdirSync(imgdir);
            this.imgpaths = [];
            for (const f of filelist) {
                const fullname = [imgdir, f].join('/');
                if (this.es.fs.statSync(fullname).isDirectory()) {
                    this.imgpaths = this.imgpaths.concat(this.es.fs.readdirSync(fullname).map(v => ['file://', fullname, v].join('/')));
                } else {
                    this.imgpaths.push('file://' + fullname);
                }
            }
            this.currentPicIndex = 0;
        } else {
            this.imgpaths = [];
        }
        if (this.viewdata.viewType.detailView === 'video') {
            this.showtitle = data.v[2].v;
            const storname = data.v[1].v;
            const ext = (data.v[2].v as string).split('.').pop();
            this.videopath = ['file://', ...basepath, 'store', storname[0], storname + '.' + ext].join('/');
            this.userExterntools = false;
        } else {
            this.videopath = '';
        }
    }
    onmousewheelOnPiclist(sender: CdkVirtualScrollViewport, $event: any) {
        const offset = $event.wheelDelta < 0 ? 1 : -1;
        this.currentPicIndex += offset;
        if (this.currentPicIndex < 0) { this.currentPicIndex = this.imgpaths.length - 1; }
        if (this.currentPicIndex >= this.imgpaths.length) { this.currentPicIndex = 0; }
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
    close() {
        window.close();
    }
    errorShow($event) {
        console.log($event);
        this.userExterntools = true;
    }
    openwithexterntools() {
        this.es.fs.promises.readFile('./setting.json', { encoding: 'utf8' }).then((str) => {
            const mplay = JSON.parse(str).mplay;
            this.es.childProcess.exec(`${mplay} ${this.videopath}`);
        });
    }

    StartSerach(name: string, search: string) {
        if (this.viewdata.viewType === null) {
            return;
        }
        this.viewdata.viewdata[this.currfindIndex].attr = { 'ant-menu-item-selected': false };
        const i = this.viewdata.columns.indexOf(name);
        const currfindIndex = this.viewdata.tabledata.findIndex(
            (v, index) => v.v[i].v.toString().indexOf(search) >= 0 && index > this.currfindIndex);
        if (currfindIndex >= 0) {
            this.scrollToIndex(currfindIndex);
            this.currfindIndex = currfindIndex;
            this.viewdata.viewdata[this.currfindIndex].attr = { 'ant-menu-item-selected': true };
        } else {
            this.currfindIndex = 0;
            this.message.warning('查找失败，已到达底部');
        }

    }
    searchInputEnter($event: KeyboardEvent, name: string, search: string) {
        if ($event.key === 'Enter') {
            this.StartSerach(name, search);
        }
    }
}
