/**
 * Provides the properties that can be used to render a Single Page Application (SPA).
 */
export class SpaAppHostProperties {
    private _headScriptPaths: string[]
    private _applicationScriptPaths: string[]

    /**
     * Initializes a new set of properties to render a Single Page Application (SPA).
     *
     * @param headScriptPaths An array of scripts paths that should be rendered in the <head/> section of
     * the HTML to be generated.
     * @param applicationScriptPaths An array of script paths that represent the SPA. These should be
     * rendered in the <body/> section of the HTML to be generated.
     */
    constructor(headScriptPaths: string[], applicationScriptPaths: string[]) {
        this._headScriptPaths = headScriptPaths;
        this._applicationScriptPaths = applicationScriptPaths;
    }

    /**
     * Gets the scripts to render in the HTML 'head' element.
     *
     * @returns An array of script paths.
     */
    public get headScriptPaths(): string[] {
        return this._headScriptPaths;
    }

    /**
     * Gets the scripts to render in the HTML 'body' element.
     *
     * @returns An array of script paths.
     */
    public get applicationScriptPaths(): string[] {
        return this._applicationScriptPaths;
    }
}
