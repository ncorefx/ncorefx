import * as express from "express";

import {RouteActionResult} from "./RouteActionResult";

/**
 * Represents a user-defined content type that is the result of a route action.
 *
 * @typeparam T The type of content that this route action result will encapsulate.
 */
export class ContentRouteActionResult<T> extends RouteActionResult {
    private static DEFAULT_CONTENTTYPE: string = "text/plain";

    private _contentType: string;
    private _content: T;

    /**
     * Initializes a new {ContentRouteActionResult} for the given content.
     *
     * @param content The content that will be written to the response.
     * @param contentType The optional content-type that the content will be written as. If not specified,
     * then "text/plain" is used by default.
     */
    constructor(content: T, contentType?: string) {
        super();

        this._content = content;
        this._contentType = contentType || ContentRouteActionResult.DEFAULT_CONTENTTYPE;
    }

    /**
     * Gets the content-type.
     */
    public get contentType(): string {
        return this._contentType;
    }

    /**
     * Gets the content.
     */
    public get content(): T {
        return this._content;
    }

    /**
     * Writes the route action result to the ExpressJS response.
     *
     * @param response The {express.Response} to write the data to.
     */
    protected async onWriteResult(response: express.Response): Promise<void> {
        response.type(this._contentType);

        await this.onWriteContent(response);
    }

    /**
     * Writes the content to the ExpressJS response.
     *
     * @param response The {express.Response} to write the content to.
     */
    protected async onWriteContent(response: express.Response): Promise<void> {
        response.send(this._content.toString());
    }
}
