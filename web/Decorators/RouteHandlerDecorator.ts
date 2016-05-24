import {Constructor} from "@ncorefx/fxcore";

/**
 * Adds route handler metadata to the decorated class.
 *
 * @param rootPath The root path that will be applied to all route action methods
 * declared in the decorated class.
 */
export function routeHandler(rootPath: string = "/"): ClassDecorator {
    return function (target: Function) {
        let thisTarget = <Constructor<any>>target;

        Reflect.defineMetadata("ncorefx:web:root-path", rootPath, thisTarget);
    }
}
