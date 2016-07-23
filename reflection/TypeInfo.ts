import {Constructor} from "@ncorefx/core";

export class TypeInfo {
    private _typeConstructor: Constructor<any>;

    constructor(typeConstructor: Constructor<any>) {
        this._typeConstructor = typeConstructor;
    }

    public get name(): string {
        return this._typeConstructor.prototype.constructor.name;
    }

    public get typeConstructor(): Constructor<any> {
        return this._typeConstructor;
    }

    public isDerivedFrom(baseType: TypeInfo): boolean {
        return baseType.typeConstructor.prototype.isPrototypeOf(this._typeConstructor.prototype)
    }
}
