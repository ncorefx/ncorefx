import {reflect} from "@ncorefx/core";

import {CreationPolicy} from "../CreationPolicy";

/**
 * Describes how the decorated class should be exported.
 * 
 * @param creationPolicy The {CreationPolicy} that should be applied to the exported class.
 */
export function exportCreationPolicy(creationPolicy: CreationPolicy): ClassDecorator {
    return function (target: Function) {
        reflect.defineMetadata("corefx:composition:export-creationpolicy", creationPolicy, target);
    }
}
