import {Constructor} from "@ncorefx/fxcore";

import {RouteActionResult} from "../RouteActionResults/RouteActionResult";
import {HttpVerbs} from "../HttpVerbs";
import {RouteAction, RouteActionFunc} from "../RouteAction";

/**
 * Defines the decorated method as a route action that responds to a HTTP request.
 *
 * @param httpVerb A {HttpVerbs} value that the route action will respond to.
 * @param path The path that the route action will respond to.
 *
 * @remarks
 * The _path_ will be joined with any path specified on the route handler class.
 */
export function routeAction(httpVerb: HttpVerbs, path: string): MethodDecorator {
    return function (target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<RouteActionFunc>) {
        let thisTarget = <Constructor<any>>target.constructor;

        let routeActions = <Set<RouteAction>>Reflect.getOwnMetadata("ncorefx:web:route-actions", thisTarget) || new Set<RouteAction>();

        routeActions.add(new RouteAction(httpVerb, path, descriptor.value));

        Reflect.defineMetadata("ncorefx:web:route-actions", routeActions, thisTarget);

        return descriptor;
    }
}
