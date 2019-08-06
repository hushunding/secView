import { ValueType } from 'sql.js';
import { EventEmitter } from '@angular/core';

export interface ViewTypeInfo {
    table: string;
    filtes: Array<FilterInfo>;
    pattern: string;
    detailView: 'img' | 'video';
    showconums: number[];
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
    showconums: number[] = [0, 1, 2,3];
    detailView: 'img' | 'video' = 'img';
    table = 'pictrues';
    filtes = [new FilterInfo('name')];
    pattern = 'pic.db3';
}

class MyStorInfo implements ViewTypeInfo {
    showconums = [0, 2, 3, 4];
    detailView: 'img' | 'video' = 'video';
    table = 'MyStor';
    filtes = [new FilterInfo('分类')];
    pattern = 'mystor.db';
}

export const pictrue = new PictrueInfo();
export const MyStor = new MyStorInfo();
