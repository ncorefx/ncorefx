import {Constructor, reflect} from "@ncorefx/core";

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
        let importTargets = <ImportTarget[]>reflect.getMetadata("corefx:composition:import-targets", target);

        if (!importTargets) importTargets = [];

        importTargets[parameterIndex] = p1;

        if (propertyKey) {
            reflect.defineMetadata("corefx:composition:import-targets", importTargets, target, propertyKey);
        }
        else {
            reflect.defineMetadata("corefx:composition:import-targets", importTargets, target);
        }
    }
}
