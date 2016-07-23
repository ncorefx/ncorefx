import {packageSys} from "./System";
import {MissingResourceError} from "./Errors";
import {ILocationPathProvider} from "./ILocationPathProvider";
import {CultureInfo} from "./CultureInfo";

import IntlMessageFormat = require("intl-messageformat");

export class ResourceManager {
    private _resourcePathProvider: ILocationPathProvider;
    private _cultureInfo: CultureInfo;

    constructor(resourcePathProvider: ILocationPathProvider)
    constructor(resourcePathProvider: ILocationPathProvider, cultureInfo?: CultureInfo) {
        this._resourcePathProvider = resourcePathProvider;
        this._cultureInfo = cultureInfo || CultureInfo.getCurrentCulture();
    }

    public getFormattedString(stringName: string, values?: { [index: string]: string }): string {
        let strings = packageSys.getResourceStrings(this._resourcePathProvider.location, this._cultureInfo.name);

        if (!strings) {
            throw new MissingResourceError(this.getCoreFormattedString("missingStringResource", {"stringName": stringName, "cultureName": this._cultureInfo.name}));
        }

        let stringToFormat = this.traverseStrings(strings, stringName);

        if (!stringToFormat) {
            throw new MissingResourceError(this.getCoreFormattedString("missingStringResource", {"stringName": stringName, "cultureName": this._cultureInfo.name}));
        }

        let msgFormatter = new IntlMessageFormat(stringToFormat, this._cultureInfo.name);

        return msgFormatter.format(values);
    }

    private getCoreFormattedString(stringName: string, values?: { [index: string]: string }): string {
        let strings = packageSys.getResourceStrings("@ncorefx/core", this._cultureInfo.name); 
        
        let msgFormatter = new IntlMessageFormat(strings[stringName], this._cultureInfo.name);

        return msgFormatter.format(values);
    }

    private traverseStrings(strings: any, stringName: string): string {
        let stringWalkerFunc = function (currentStrings: any, tokens: string[]) {
            if (tokens.length === 1) return currentStrings[tokens[0]];

            return stringWalkerFunc(currentStrings[tokens[0]], tokens.splice(1));
        };

        return stringWalkerFunc(strings, stringName.split('.'));
    }
}
