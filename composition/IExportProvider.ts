import {Constructor} from "@ncorefx/fxcore";

import {ImportCardinalityMismatchError} from "./Errors/ImportCardinalityMismatchError";
import {ILazyExport} from "./ILazyExport";

/**
 * Retrieves exports which match given criteria.
 */
export interface IExportProvider {
    /**
     * Gets all the exports that meet with the given reflection type criteria.
     *
     * @typeparam T The reflection type that is required.
     * @param target The {Constructor} for _T_.
     *
     * @returns A promise that yields a set of {ILazyExport} objects that contain objects of
     * the _target_ reflection type if found; otherwise an empty set.
     */
    getExports<T>(target: Constructor<T>): Promise<Set<ILazyExport<T>>>;
    
    /**
     * Returns the exported objects that meet with the given reflection type criteria.
     * 
     * @typeparam T The reflection type that is required.
     * @param target The {Constructor} for _T_.
     *
     * @returns A promise that yields a set of objects that represent the _target_ reflection type
     * if found; otherwise an empty set.
     */
    getExportedValues<T>(target: Constructor<T>): Promise<Set<T>>;

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
    getExport<T>(target: Constructor<T>): Promise<ILazyExport<T>>;

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
    getExportedValue<T>(target: Constructor<T>): Promise<T>;
}
