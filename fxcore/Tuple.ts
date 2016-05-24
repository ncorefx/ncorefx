
export class Tuple<T1, T2> {
    private _item1: T1;
    private _item2: T2;

    constructor(item1: T1, item2: T2) {
        this._item1 = item1;
        this._item2 = item2;
    }

    public get item1(): T1 {
        return this._item1;
    }

    public get item2(): T2 {
        return this._item2;
    }

    public static create<T1, T2>(item1: T1, item2: T2): Tuple<T1, T2> {
        return new Tuple(item1, item2);
    }
}
