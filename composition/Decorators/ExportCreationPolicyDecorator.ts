import {Constructor} from "@ncorefx/fxcore";

import {CreationPolicy} from "../CreationPolicy";

/**
 * Describes how the decorated class should be exported.
 * 
 * @param creationPolicy The {CreationPolicy} that should be applied to the exported class.
 */
export function exportCreationPolicy(creationPolicy: CreationPolicy): ClassDecorator {
    return function (target: Function) {
        let thisTarget = <Constructor<any>>target;

        Reflect.defineMetadata("ncorefx:composition:export-creationpolicy", creationPolicy, thisTarget);
    }
}
