import { ValueType } from 'sql.js';
import { EventEmitter } from '@angular/core';

export interface ViewTypeInfo {
    table: string;
    filtes: Array<FilterInfo>;
    searches: string;
    pattern: string;
    detailView: 'img' | 'video';
    showconums: number[];
    itemsize: number;
    tdwidth: number[];
}

export interface TableEntry {
    v: Array<{
        t: string;
        v: ValueType;
    }>;
    attr: {};
}
export class ViewInfo {
    viewdata = new Array<TableEntry>();
    tabledata = new Array<TableEntry>();
    columns = new Array<string>();
    viewType: ViewTypeInfo = null;
}

export class FilterInfo {
    private _array: ValueType[];
    public get SelectArray(): ValueType[] {
        return this._array;
    }
    public set SelectArray(value: ValueType[]) {
        this._array = value;
        this.event.emit({ name: this.name, array: value });
    }
    event = new EventEmitter<{ name: string, array: ValueType[] }>(true);
    constructor(public name: string) { }
    filteritems = [];
}

class PictrueInfo implements ViewTypeInfo {
    itemsize = 54;
    showconums: number[] = [0, 1, 2, 3];
    tdwidth: number[] = [54, 104, 128, 480, 0, 0, 0, 0];
    detailView: 'img' | 'video' = 'img';
    table = 'pictrues';
    filtes = [new FilterInfo('name')];
    pattern = 'pic.db3';
    searches = 'tiles';

}

class MyStorInfo implements ViewTypeInfo {
    itemsize = 128;
    showconums = [0, 2, 3, 4];
    tdwidth: number[] = [54, 0, 400, 160, 160, 0, 0, 0, 0];
    detailView: 'img' | 'video' = 'video';
    table = 'MyStor';
    filtes = [new FilterInfo('分类')];
    pattern = 'mystor.db';
    searches = 'RealName';
}

export const pictrue = new PictrueInfo();
export const MyStor = new MyStorInfo();
