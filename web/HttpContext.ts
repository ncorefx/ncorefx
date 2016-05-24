import {Context} from "@ncorefx/fxcore";

import * as express from "express";

/**
 * Encapsulates all HTTP specific information about an individual HTTP request.
 */
export class HttpContext {
    private _request: express.Request;

    /**
     * Initializes a new {HttpContext} that encapsulates the given ExpressJS request.
     *
     * @param request The {express.Request} that representing the current HTTP request.
     */
    constructor(request: express.Request) {
        this._request = request;
    }

    /**
     * Gets the current ExpressJS request object.
     *
     * @returns A {express.Request}.
     */
    public get request(): express.Request {
        return this._request;
    }

    /**
     * Gets the current {HttpContext} object.
     *
     * @returns A {HttpContext}.
     */
    public static get current(): HttpContext {
        return Context.getContextObject(HttpContext);
    }
}
