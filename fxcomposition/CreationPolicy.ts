/**
 * Specifies when and how an export will be instantiated.
 */
export enum CreationPolicy {
    /**
     * Specifies that a new non-shared instance of the associated export will be created by the
     * CompositionContainer for every request.
     */
    Shared,
    
    /**
     * Specifies that a single shared instance of the associated export will be created by the
     * CompositionContainer and shared for all requests.
     */
    NonShared
}
