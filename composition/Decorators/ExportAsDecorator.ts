import {Constructor} from "@ncorefx/fxcore";

import {ExportTargetSet} from "../ExportBuilders/ExportTargetSet";

/**
 * Exports the decorated class.
 *
 * @param baseTargets An array of {Constructor} objects that represent the types that the reflected
 * type should be exported as.
 */
export function exportAs(...baseTargets: Constructor<any>[]): ClassDecorator {
    return function (target: Function) {
        let thisTarget = <Constructor<any>>target;

        let exportTargets = new ExportTargetSet(!baseTargets || baseTargets.length === 0 ? [thisTarget] : baseTargets);

        Reflect.defineMetadata("ncorefx:composition:export-targets", exportTargets, thisTarget);
    }
}
