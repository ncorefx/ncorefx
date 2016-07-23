import {Constructor} from "@ncorefx/core";

import {IExportProvider} from "./IExportProvider";
import {ILazyExport} from "./ILazyExport";
import {ExportProviderFunc} from "./ImportTarget";

/**
 * An import target that retrieves the export of a given reflection type.
 * 
 * @typeparam T The reflection type that is required.
 * @param target The {Constructor} for _T_.
 * 
 * @returns An {ExportProviderFunc} that retrieves the export of type _target_.
 */
export function lazy<T>(target: Constructor<T>): ExportProviderFunc {
    return async function (exportProvider: IExportProvider): Promise<ILazyExport<T>> {
        return exportProvider.getExport<T>(target);
    }
}

/**
 * An import target that retrieves multiple exported objects of a given reflection type.
 * 
 * @typeparam T The reflection type that is required.
 * @param target The {Constructor} for _T_.
 * 
 * @returns An {ExportProviderFunc} that retrieves the exported objects of type _target_.
 */
export function many<T>(target: Constructor<T>): ExportProviderFunc {
    return async function (exportProvider: IExportProvider): Promise<Iterable<T>> {
        return exportProvider.getExportedValues(target);
    }
}

/**
 * An import target that retrieves the exports of a given reflection type.
 * 
 * @typeparam T The reflection type that is required.
 * @param target The {Constructor} for _T_.
 * 
 * @returns An {ExportProviderFunc} that retrieves the exports of type _target_.
 */
export function lazyMany<T>(target: Constructor<T>): ExportProviderFunc {
    return async function (exportProvider: IExportProvider): Promise<Iterable<ILazyExport<T>>> {
        return exportProvider.getExports<T>(target);
    }
}
