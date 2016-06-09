import {Constructor, memoize} from "@ncorefx/fxcore";

import * as React from "react";

import {ContentRouteActionResult} from "./RouteActionResults/ContentRouteActionResult";
import {JsonRouteActionResult} from "./RouteActionResults/JsonRouteActionResult";
import {ReactViewRouteActionResult} from "./RouteActionResults/ReactViewRouteActionResult";

/**
 * A base class for route handlers. Route handler provide route action methods that
 * respond to HTTP requests.
 */
export class RouteHandler {
    /**
     * Creates a {ContentRouteActionResult} object for the given string.
     *
     * @param content The content to write to the response.
     * @param contentType The optional content type (MIME type).
     *
     * @returns A {ContentRouteActionResult} that will write the content to the response.
     */
    protected content(content: string, contentType?: string): ContentRouteActionResult<string> {
        return new ContentRouteActionResult(content, contentType);
    }

    /**
     * Creates a {JsonRouteActionResult} object that serializes the specified object to JavaScript
     * Object Notation (JSON).
     *
     * @param data The object to write as JSON to the response.
     * @param contentType The optional content type (MIME type).
     *
     * @returns A {JsonRouteActionResult} that will write the data as JSON to the response.
     */
    protected json(data: any, contentType?: string): JsonRouteActionResult {
        return new JsonRouteActionResult(data, contentType);
    }

    /**
     * Creates a {ReactViewRouteActionResult} object that renders the supplied React element as HTML.
     *
     * @param reactElement The {ReactElement} to serialize into HTML.
     * @param contentType The optional content type (MIME type).
     *
     * @returns A {ReactViewRouteActionResult} that will write the data as HTML to the response.
     */
    protected reactView(reactElement: React.ReactElement<any>, contentType?: string): ReactViewRouteActionResult {
        return new ReactViewRouteActionResult(reactElement, contentType);
    }
}
