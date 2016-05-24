import * as express from "express";

import {ContentRouteActionResult} from "./ContentRouteActionResult";

/**
 * Represents a JSON content type that is the result of a route action.
 */
export class JsonRouteActionResult extends ContentRouteActionResult<any> {
    private static JSON_CONTENTTYPE: string = "application/json";

    /**
     * Initializes a new {JsonRouteActionResult} object for the given data.
     *
     * @param data The JSON object that should be rendered.
     * @param The optional content-type that should be used when sending this content.
     */
    constructor(data: any, contentType?: string) {
        super(data, contentType || JsonRouteActionResult.JSON_CONTENTTYPE);
    }

    /**
     * Overrides {ContentRouteActionResult#onWriteContent} to write the JSON data to the resposne.
     *
     * @param response The {express.Response} to write the content to.
     */
    protected async onWriteContent(response: express.Response): Promise<void> {
        response.send(JSON.stringify(this.content));
    }
}
