import * as express from "express";
import {ReactElement} from "react";
import {renderToString} from "react-dom/server";

import {ContentRouteActionResult} from "./ContentRouteActionResult";

/**
 * Represents a HTML content type that is the result of rendering a React element.
 */
export class ReactViewRouteActionResult extends ContentRouteActionResult<ReactElement<any>> {
    private static REACT_CONTENTTYPE: string = "text/html";

    /**
     * Initializes a new {ReactViewRouteActionResult} object for a given React element.
     *
     * @param reactElement The {ReactElement} that should be rendered.
     * @param The optional content-type that should be used when sending this content.
     */
    constructor(reactElement: ReactElement<any>, contentType?: string) {
        super(reactElement, contentType || ReactViewRouteActionResult.REACT_CONTENTTYPE);
    }

    /**
     * Overrides {ContentRouteActionResult#onWriteContent} to write the React element to the resposne.
     *
     * @param response The {express.Response} to write the content to.
     */
    protected async onWriteContent(response: express.Response): Promise<void> {
        response.send(renderToString(this.content));
    }
}
