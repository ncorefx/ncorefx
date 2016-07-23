import {Constructor, reflect} from "@ncorefx/core";

import {TypeInfo} from "@ncorefx/reflection";

import {ExportTargetSet} from "../ExportBuilders/ExportTargetSet";

/**
 * Exports the decorated class.
 *
 * @param baseTargets An array of {Constructor} objects that represent the types that the reflected
 * type should be exported as.
 */
export function exportAs(...baseTargets: Constructor<any>[]): ClassDecorator {
    return function (target: Function) {
        let typeConstructor = <Constructor<any>>target;

        let exportTargets =
            new ExportTargetSet(!baseTargets || baseTargets.length === 0
                ? [new TypeInfo(typeConstructor)]
                : baseTargets.map((baseTarget) => new TypeInfo(baseTarget)).concat([new TypeInfo(typeConstructor)]));

        reflect.defineMetadata("corefx:composition:export-targets", exportTargets, target);
    }
}
