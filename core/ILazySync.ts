/**
 * Provides support for lazy initialization.
 */
export interface ILazySync<T> {
    /**
     * Gets the lazily initiated value of the current {Lazy} object.
     */
    value: T;
}
