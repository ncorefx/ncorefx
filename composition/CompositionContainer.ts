import {Constructor} from "@ncorefx/fxcore";

import {IExportProvider} from "./IExportProvider";
import {ILazyExport} from "./ILazyExport";

/**
 * Manages the composition of exports.
 */
export class CompositionContainer implements IExportProvider {
    /**
     * Initializes a new {CompositionContainer} object with the specified
     * export provider.
     *
     * @param exportProvider The {IExportProvider} implementation that provides the
     * Composition Container access to exportable instances.
     */
    constructor(protected exportProvider: IExportProvider) {
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
        return await this.exportProvider.getExports<T>(target);
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
        return await this.exportProvider.getExportedValues<T>(target);
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
        return await this.exportProvider.getExport<T>(target);
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
     */
    public async getExportedValue<T>(target: Constructor<T>): Promise<T> {
        return await this.exportProvider.getExportedValue<T>(target);
    }
}
