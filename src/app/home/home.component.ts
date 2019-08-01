import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { DBDataService } from './dbdata.service';
import { QueryResults, ValueType } from 'sql.js';
import { ElectronService } from '../core/services';
import { NzTableComponent } from 'ng-zorro-antd';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {

  @ViewChild('nzTable', { static: false }) nzTableComponent: NzTableComponent;
  constructor(private db: DBDataService, private es: ElectronService) { }

  public DBDATA: QueryResults;
  loading = true;
  tabledata: ValueType[][] = [];
  // MyStor
  ngOnInit() {
    this.db.loaddb('pic.db3', 'pictrues').then((DBDATA) => {
      this.DBDATA = DBDATA;
      this.tabledata = DBDATA.values as any;
      for (let i = 0; i < this.tabledata.length; i++) {
        this.tabledata[i].unshift(i);
      }
      this.loading = false;
    });
  }
  isTextData(i: ValueType) {
    const typestr = typeof i;
    return typestr === 'number' || typestr === 'string';
  }

  toImage(i: Uint8Array) {
    if (i !== null) {
      const img = this.es.nativeImage.createFromBuffer(Buffer.from(i.buffer));
      return img.toDataURL();
    }
    return '';
  }
  scrollToIndex(index: number): void {
    this.nzTableComponent.cdkVirtualScrollViewport.scrollToIndex(index);
  }

  ngAfterViewInit(): void {
    this.nzTableComponent.cdkVirtualScrollViewport.scrolledIndexChange
      .subscribe((data: number) => {
        console.log('scroll index to', data);
      });
  }
  trackByIndex(_: number, data): number {
    return data[0];
  }

}
