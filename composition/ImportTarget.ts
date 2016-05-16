import {Constructor} from "@ncorefx/fxcore";

import {IExportProvider} from "./IExportProvider";

/**
 * A function that returns an import.
 */
export declare type ExportProviderFunc = (exportProvider: IExportProvider) => Promise<any>;

/**
 * A target of an import.
 * 
 * @remarks
 * A target of an import can either be a {Constructor} that represents a reflected type,
 * or an {ExportProviderFunc} that is invoked to obtain the import.
 */
export declare type ImportTarget = (Constructor<any> | ExportProviderFunc);
