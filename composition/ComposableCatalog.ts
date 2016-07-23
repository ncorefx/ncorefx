import {memoize, Constructor, Lazy} from "@ncorefx/core";

import {ModuleInfo, TypeInfo} from "@ncorefx/reflection";

import {CompositionError, ImportCardinalityMismatchError} from "./Errors";
import {IExportProvider} from "./IExportProvider";
import {ILazyExport} from "./ILazyExport";
import {IMetadataProvider} from "./IMetadataProvider";
import {IReflectionContext} from "./IReflectionContext";
import {DefaultReflectionContext} from "./DefaultReflectionContext";

/**
 * Represents the abstract base class for composable catalogs, which collect and return exportable instances
 * of reflection types.
 */
export abstract class ComposableCatalog implements IExportProvider {
    /**
     * Initializes the base {ComposableCatalog} object.
     *
     * @param reflectionContext An optional {IReflectionContext} implementation to apply to the reflected types.
     *
     * @remarks
     * If _reflectionContext_ is *null* or *undefined*, then the default reflection context will be applied to
     * the reflected types collected by the catalog.
     */
    constructor(private reflectionContext?: IReflectionContext) {
        if (!this.reflectionContext) {
            this.reflectionContext = new DefaultReflectionContext();
        }
     }

    /**
     * Retrieves the reflection types that meet with the criteria defined by the reflection context.
     *
     * @returns A promise that yields a set of {Constructor} objects representing all the reflected
     * types that met with the reflection context.
     *
     * @remarks
     * Since gathering the reflected types can be an intensive process the results of this method are
     * memoized for subsequent invocations.
     */
    @memoize()
    public async getReflectionTargets(): Promise<Set<TypeInfo>> {
        let catalogExports = new Set<TypeInfo>();

        await this.onEnumerate(this.processTypeOrModule.bind(this, catalogExports));

        return catalogExports;
    }

    /**
     * Gets all the exports that meet with the given reflection type criteria.
     *
     * @typeparam T The reflection type that is required.
     * @param target The {Constructor} for _T_.
     *
     * @returns A promise that yields a set of {ILazyExport} objects that contain objects of
     * the _target_ reflection type if found; otherwise an empty set.
     */
    public async getExports<T>(target: Constructor<T>): Promise<Set<ILazyExport<T>>> {
        let exports = new Set<ILazyExport<T>>();

        for (let reflectionTarget of await this.getReflectionTargets()) {
            let reflectedExport = await this.reflectionContext.getExport(reflectionTarget, new TypeInfo(target), this);

            if (reflectedExport) {
                exports.add(reflectedExport);
            }
        }

        return exports;
    }
    
    /**
     * Returns the exported objects that meet with the given reflection type criteria.
     * 
     * @typeparam T The reflection type that is required.
     * @param target The {Constructor} for _T_.
     *
     * @returns A promise that yields a set of objects that represent the _target_ reflection type
     * if found; otherwise an empty set.
     */
    public async getExportedValues<T>(target: Constructor<T>): Promise<Set<T>> {
        let exports = new Set<T>();

        for (let exportedObj of await this.getExports<T>(target)) {
            exports.add(await exportedObj.value);
        }
        
        return exports;
    }

    /**
     * Returns the export that meets with the given reflection type criteria.
     *
     * @typeparam T The reflection type that is required.
     * @param target The {Constructor} for _T_.
     *
     * @returns A promise that yields an {ILazyExport} object that contains an object of the
     * _target_ reflection type.
     *
     * @throws {ImportCardinalityMismatchError}
     * There are zero exports that meet the given reflection type criteria.
     *
     * -or-
     *
     * There is more than one export that meets the given reflection type criteria.
     */
    public async getExport<T>(target: Constructor<T>): Promise<ILazyExport<T>> {
        let exports = await this.getExports<T>(target);

        if (exports.size !== 1) {
            throw new ImportCardinalityMismatchError(target);
        }

        return exports.values().next().value;
    }

    /**
     * Returns the exported object that meets with the given reflection type criteria.
     *
     * @typeparam T The reflection type that is required.
     * @param target The {Constructor} for _T_.
     *
     * @returns A promise that yields a _T_ object.
     *
     * @throws {ImportCardinalityMismatchError}
     * There are zero exports that meet the given reflection type criteria.
     *
     * -or-
     *
     * There is more than one export that meets the given reflection type criteria.
     * 
     * @throws {CompositionError}
     * An error occurred during the composition of the object described by _target_.
     */
    public async getExportedValue<T>(target: Constructor<T>): Promise<T> {
        return (await this.getExport<T>(target)).value;
    }

    /**
     * Enumerates the reflection types of the current composable catalog.
     *
     * @param exportCallback A callback to invoke for a module or a reflected type.
     *
     * @remarks
     * Classes that derive from {ComposableCatalog} must implement this method to provide their
     * own logic for discovering reflected types.
     */
    protected abstract async onEnumerate(exportCallback: (targetOrModule: TypeInfo | ModuleInfo) => void): Promise<void>;

    /**
     * Processes a reflection target or module and includes them in a given set of exports if they meet with
     * the criteria defined by the reflection context.
     *
     * @param catalogExports The set of {Constructor} objects that should be added to.
     * @param targetOrModule The reflection target or module that should be considered against the reflection
     * context.
     *
     * @remarks
     * This method is called when a class that derives from {ComposableCatalog} is enumerating
     * through its discovered reflection types.
     */
    private processTypeOrModule(catalogExports: Set<TypeInfo>, typeOrModule: TypeInfo | ModuleInfo): void {
        if (typeOrModule instanceof TypeInfo) {
            let reflectedType = <TypeInfo>typeOrModule;

            if (this.reflectionContext.meetsContext(reflectedType)) {
                catalogExports.add(reflectedType);
            }

            return;
        }

        if (typeOrModule instanceof ModuleInfo) {
            let reflectedModule = <ModuleInfo>typeOrModule;

            for (let typeInfo of reflectedModule.types) {
                if (this.reflectionContext.meetsContext(typeInfo)) {
                    catalogExports.add(typeInfo);
                }
            }
        }
    }
}
