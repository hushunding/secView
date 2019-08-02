import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { DBDataService } from './dbdata.service';
import { QueryResults, ValueType } from 'sql.js';
import { ElectronService } from '../core/services';
import { NzTableComponent } from 'ng-zorro-antd';
import { fstat } from 'fs';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {

  @ViewChild('nzTable', { static: false }) nzTableComponent: NzTableComponent;
  constructor(private db: DBDataService, private es: ElectronService) { }

  public DBDATA: QueryResults;
  loading = false;
  tabledata: ValueType[][] = [];

  pictrues = {
    table: 'pictrues'
  };
  MyStor = {
    table: 'MyStor'
  };
  dbfilepath = '';
  viewname = null;

  opendbdata(path: string) {
    this.viewname = path.endsWith('pic.db3') ? this.pictrues : path.endsWith('mystor.db') ? this.MyStor : null;
    if (this.viewname === null) {
      console.log('错误的数据文件');
      return;
    }
    this.dbfilepath = path;
    this.loading = true;
    this.db.loaddb(path, this.viewname.table).then((DBDATA) => {
      this.DBDATA = DBDATA;
      this.tabledata = DBDATA.values as any;
      for (let i = 0; i < this.tabledata.length; i++) {
        this.tabledata[i].unshift(i);
      }
      this.loading = false;
    });
  }
  // MyStor
  ngOnInit() {

  }
  isTextData(i: ValueType) {
    const typestr = typeof i;
    return typestr === 'number' || typestr === 'string';
  }

  toImage(item: Uint8Array, i: number, j: number) {
    return ('');
    if (item !== null) {
      const img = this.es.nativeImage.createFromBuffer(Buffer.from(item.buffer));
      return (img.toDataURL());
    } else {
      return ('');
    }
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
