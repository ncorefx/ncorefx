import {TypeInfo} from "@ncorefx/reflection";

import {IExportProvider} from "./IExportProvider";
import {ILazyExport} from "./ILazyExport";

/**
 * Represents a customizable reflection context for importing reflection types.
 *
 * @remarks
 * The default reflection context used during composition simply imports reflection types without making
 * any changes.
 */
export interface IReflectionContext {
    /**
     * Determines if a reflected type satisfies the current reflection context.
     *
     * @param reflectedTarget The {Constructor} that should be tested against the current context.
     *
     * @returns *true* if _reflectedTarget_ satisfies the current context; otherwise *false*.
     */
    meetsContext(reflectedTarget: TypeInfo): boolean;

    /**
     * Retrieves an export from the current reflection context.
     *
     * @param reflectedTarget The {Constructor} that should be tested against the current context.
     * @param exportTarget The {Constructor} that an export is required for.
     * @param exportProvider The export provider that can be used to retrieve further exports if they are
     * required by the export being requested.
     *
     * @returns A promise that yields an {ILazyExport} object for _exportTarget_ if it meets with the current
     * reflection context; otherwise *undefined*.
     */
    getExport(reflectedTarget: TypeInfo, exportTarget: TypeInfo, exportProvider: IExportProvider): Promise<ILazyExport<any>>;
}
