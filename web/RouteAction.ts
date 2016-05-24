import {RouteActionResult} from "./RouteActionResults/RouteActionResult";

import {HttpVerbs} from "./HttpVerbs";

/**
 * A function that returns a route action result or a promise that yields a route action
 * result.
 */
export type RouteActionFunc = (...args: any[]) => RouteActionResult | Promise<RouteActionResult>;

/**
 * Encapsulates data about a route action.
 */
export class RouteAction {
    /**
     * Initializes a new {RouteAction} that describes the given HTTP verb, path, and
     * function to invoke when the route is invoked.
     *
     * @param httpVerb A {HttpVerbs} value that represents the verb the route should apply to.
     * @param path The path or regular expression that the route is to be associated with.
     * @param routeActionFunc The {RouteActionFunc} to invoke when the route in invoked.
     */
    constructor(public httpVerb: HttpVerbs, public path: string | RegExp, public routeActionFunc: RouteActionFunc) {
    }
}
