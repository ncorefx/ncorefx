import {ILazy} from "@ncorefx/fxcore";

import {IMetadataProvider} from "./IMetadataProvider";

/**
 * Represents a lazily initialized export.
 */
export interface ILazyExport<T> extends ILazy<T> {
    /**
     * Gets the metadata that is associated with the export.
     */
    metadata: IMetadataProvider;
}
