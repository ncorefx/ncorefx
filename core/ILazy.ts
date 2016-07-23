/**
 * Provides support for lazy initialization.
 */
export interface ILazy<T> {
    /**
     * Gets the lazily initiated value of the current {Lazy} object.
     */
    value: Promise<T>;
}
