import IntlMessageFormat = require("intl-messageformat");

import * as path from "path";
import * as fs from "fs";

import {memoize} from "../Decorators/MemoizeDecorator";
import {nodeGuard} from "../Decorators/NodeGuardDecorator";

import {MissingResourcesError} from "../Errors/MissingResourcesError";

import {PackageInfo} from "../PackageInfo";
import {CultureInfo} from "../CultureInfo";

export class ResourceManager {
    private _packageInfo: PackageInfo;
    private _cultureInfo: CultureInfo;

    constructor(packageInfo: PackageInfo)
    constructor(packageInfo: PackageInfo, cultureInfo?: CultureInfo) {
        this._packageInfo = packageInfo;
        this._cultureInfo = cultureInfo || CultureInfo.getCurrentCulture();
    }

    @nodeGuard()
    public getFormattedString(stringName: string, values?: Object): string {
        let stringsFilePath = path.join(this._packageInfo.location, ".resources", this._cultureInfo.name, "strings.json");

        let strings = ResourceManager.getStrings(stringsFilePath);

        if (!strings) throw new MissingResourcesError(`Could not find string resource '${stringName}' for culture '${this._cultureInfo.name}'.`);

        let msgFormatter = new IntlMessageFormat(strings[stringName], this._cultureInfo.name);

        return msgFormatter.format(values);
    }

    private getFormattedString_Browser(stringName: string, values?: Object): string {
        let resourceSet = <Map<string, any>>Reflect.getMetadata("ncorefx:resources:strings", window);

        if (!resourceSet) throw new MissingResourcesError(`Could not find string resource '${stringName}' for culture '${this._cultureInfo.name}'.`);

        let strings = resourceSet.get(this._cultureInfo.name);

        if (!strings) throw new MissingResourcesError(`Could not find string resource '${stringName}' for culture '${this._cultureInfo.name}'.`);

        let msgFormatter = new IntlMessageFormat(strings[stringName], this._cultureInfo.name);

        return msgFormatter.format(values);
    }

    @memoize()
    private static getStrings(stringsFilePath: string): Object {
        if (!fs.existsSync(stringsFilePath)) return undefined;

        return require(stringsFilePath);
    }
}
