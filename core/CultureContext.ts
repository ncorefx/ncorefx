import {Context} from "./Context";

/**
 * Establishes a specific locale within an execution context.
 */
export class CultureContext {
    private _cultureName: string;

    /**
     * Initializes a new {CultureContext} object for the given culture name.
     *
     * @param cultureName The name of a culture in the format 'languagecode2-country/regioncode2'
     * (ISO 639-1).
     */
    constructor(cultureName: string) {
        this._cultureName = cultureName;
    }

    /**
     * Gets the culture name in the format 'languagecode2-country/regioncode2'.
     *
     * @returns A string representing the culture name.
     */
    public get name(): string {
        return this._cultureName;
    }

    /**
     * Gets the current {CultureContext} object.
     *
     * @returns The current {CultureContext} object; otherwise *undefined*.
     */
    public static get current(): CultureContext {
        return Context.getContextObject(CultureContext);
    }
}
