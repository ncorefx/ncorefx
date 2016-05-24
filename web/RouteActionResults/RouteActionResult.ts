import * as express from "express";

/**
 * Encapsulates the result of a route action method.
 */
export abstract class RouteActionResult {
    /**
     * Writes the route action result to an ExpressJS response.
     *
     * @param response The {express.Response} to write the data to.
     */
    public async writeResult(response: express.Response): Promise<void> {
        await this.onWriteResult(response);

        response.end();
    }

    /**
     * Should be overriden to write the route action result to an ExpressJS response.
     *
     * @param response The {express.Response} to write the data to.
     */
    protected abstract async onWriteResult(response: express.Response): Promise<void>;
}
