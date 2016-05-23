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
}
