import {CultureContext} from "./CultureContext";
import {getOSSystem} from "./System";

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
    public static getCurrentCulture(): CultureInfo {
        let cultureCtx = CultureContext.current;

        if (cultureCtx) return new CultureInfo(cultureCtx.name);

        return CultureInfo.getSystemCulture();
    }

    /**
     * Gets a {CultureInfo} object that represents the culture of the system.
     *
     * @returns A {CultureInfo} object representing the system culture.
     *
     * @remarks
     * In a Node.js runtime, the system culture is determined by querying the Operating System. In
     * a Browser runtime, the culture is taken from the value of 'navigator.language'.
     */
    public static getSystemCulture(): CultureInfo {
        return new CultureInfo(getOSSystem().locale());
    }
}
