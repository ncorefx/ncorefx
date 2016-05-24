import {Constructor,
        ConstructorGuard,
        Lazy} from "@ncorefx/fxcore";

import {IExportProvider} from "../IExportProvider";
import {ImportTarget, ExportProviderFunc} from "../ImportTarget";

import {ImportCardinalityMismatchError} from "../Errors/ImportCardinalityMismatchError";
import {ImportTargetError} from "../Errors/ImportTargetError";
import {CompositionError} from "../Errors/CompositionError";

/**
 * A utility class that retrieves exported values through reflection.
 */
export class ReflectionExporter {
    /**
     * Retrieves an exported value through reflection. Any dependencies are requested through a supplied
     * export provider.
     *
     * @param exportProvider The {IExportProvider} that can be used to retrieve further exports if they
     * are required.
     * @param target The {Constructor} that represents the reflection type that a value is required for.
     * @param importTargets An optional array of {ImportTarget} objects that describe the import requirements
     * for _target_. If *undefined* then any import targets defined through reflection are used.
     *
     * @returns A promise that yields an object of type _target_.
     * 
     * @throws {CompositionError}
     * An error occurred while importing the dependencies of the _target_ reflection type.
     */
    public static async getExportedValue(exportProvider: IExportProvider, target: Constructor<any>, importTargets?: ImportTarget[]): Promise<any> {
        let designTypes = <any[]>Reflect.getMetadata("design:paramtypes", target) || [];

        importTargets = importTargets
            || <ImportTarget[]>Reflect.getMetadata("ncorefx:composition:import-targets", target)
            || [];

        let argsLength = Math.max(designTypes.length, importTargets.length);
        let targetArgs = new Array<any>(argsLength);
        let targetArgsErrors = new Array<ImportTargetError>();

        for (let argsIndex = 0; argsIndex < argsLength; argsIndex++) {
            let argsImportTarget: ImportTarget = importTargets[argsIndex] || designTypes[argsIndex];

            if (!argsImportTarget) {
                targetArgsErrors.push(new ImportTargetError(argsIndex));

                continue;
            }

            try {
                if (ConstructorGuard.isConstructor(argsImportTarget)) {
                    targetArgs[argsIndex] = await exportProvider.getExportedValue(argsImportTarget);
                }
                else {
                    targetArgs[argsIndex] = await (<ExportProviderFunc>argsImportTarget)(exportProvider);
                }
            }
            catch (error) {
                targetArgsErrors.push(new ImportTargetError(argsIndex, argsImportTarget, error));
            }
        }

        if (targetArgsErrors.length > 0) throw new CompositionError(target, targetArgsErrors);

        return Reflect.construct(target, targetArgs);
    }
}
