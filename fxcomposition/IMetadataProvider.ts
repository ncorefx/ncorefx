import {Constructor} from "@ncorefx/fxcore";

/**
 * Provides access to metadata.
 */
export interface IMetadataProvider {
    /**
     * Returns the metadata for a given metadata key.
     *
     * @param metadataKey The key.
     *
     * @returns The metadata value that is associated with _key_; otherwise *undefined*.
     */
    getMetadata(metadataKey: string): any;

    /**
     * Gets the reflected target that the metadata is associated with.
     *
     * @returns A {Constructor} that represents the reflected type.
     */
    target: Constructor<any>;
}
