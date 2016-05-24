import {Constructor} from "@ncorefx/fxcore";

import {IExportProvider} from "../IExportProvider";
import {ImportTarget, ExportProviderFunc} from "../ImportTarget";

/**
 * Associates an import target that imports an export of the reflected type for the decorated parameter.
 */
export function importAs(): ParameterDecorator
/**
 * Associates an import target that imports an export of the given reflected type for the decorated
 * parameter.
 *
 * @typeparam T The reflection type that is required.
 * @param target The {Constructor} for _T_.
 */
export function importAs<T>(target: Constructor<T>): ParameterDecorator
/**
 * Associates an import target that imports an export from a export provider function.
 *
 * @param exportFunc The {ExportProviderFunc} that will be invoked to obtain the export.
 */
export function importAs(exportFunc: ExportProviderFunc): ParameterDecorator
export function importAs(p1?: any): ParameterDecorator {
    return function (target: Object, propertyKey: string | symbol, parameterIndex: number): void {
        let thisTarget = <Constructor<any>>target;

        let importTargets = <ImportTarget[]>Reflect.getMetadata("ncorefx:composition:import-targets", thisTarget);

        if (!importTargets) importTargets = [];

        importTargets[parameterIndex] = p1;

        if (propertyKey) {
            Reflect.defineMetadata("ncorefx:composition:import-targets", importTargets, thisTarget, propertyKey);
        }
        else {
            Reflect.defineMetadata("ncorefx:composition:import-targets", importTargets, thisTarget);
        }
    }
}
