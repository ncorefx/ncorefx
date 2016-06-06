import * as osLocale from "os-locale";

import {memoize} from "./Decorators/MemoizeDecorator";
import {nodeGuard} from "./Decorators/NodeGuardDecorator";

import {CultureContext} from "./CultureContext";

/**
 * Provides information about a specific locale.
 */
export class CultureInfo {
    private _cultureName: string;

    /**
     * Initializes a new {CultureInfo} object for the given culture name.
     *
     * @param cultureName The name of a culture in the ISO 639-1 format.
     */
    constructor(cultureName: string) {
        this._cultureName = cultureName;
    }

    /**
     * Gets the culture name in the ISO 639-1 format.
     *
     * @returns A string representing the culture name.
     */
    public get name(): string {
        return this._cultureName;
    }

    /**
     * Gets a {CultureInfo} object that represents the culture that is currently in context.
     *
     * @returns A {CultureInfo} object that is currently in context, otherwise a {CultureInfo} object
     * that represents the culture determined from the runtime.
     */
    @nodeGuard()
    public static getCurrentCulture(): CultureInfo {
        let cultureCtx = CultureContext.current;

        if (cultureCtx) return new CultureInfo(cultureCtx.name);

        return new CultureInfo(CultureInfo.getOSLocaleString());
    }

    private static getCurrentCulture_Browser(): CultureInfo {
        let cultureCtx = CultureContext.current;

        if (cultureCtx) return new CultureInfo(cultureCtx.name);

        return new CultureInfo(window.navigator.language || window.navigator.language);
    }

    /**
     * Returns the current locale string from the Operating System.
     *
     * @returns A string representing the current locale from the Operating System, or "en-US" if the locale
     * could not be found.
     */
    @memoize()
    private static getOSLocaleString(): string {
        return osLocale.sync().replace("_", "-");
    }
}
