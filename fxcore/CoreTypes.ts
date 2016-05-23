/**
 * Represents a constructor function.
 *
 * @typeparam T The type of object that the constructor function will create.
 */
export type Constructor<T> = { new(...args: any[]): T };

/**
 * A utility class that provides a type guard for {Constructor}.
 */
export class ConstructorGuard {
    /**
     * Determines if a supplied object is a {Constructor}.
     *
     * @param obj The object to be gaurded.
     *
     * @returns *true* if _obj_ is a {Constructor}; otherwise *false*.
     *
     * @remarks
     * If _obj_ is determined to be a {Constructor} then the object will be narrowed to the
     * {Constructor} type in the current scope block.
     */
    public static isConstructor<T>(obj: any): obj is Constructor<T> {
        return obj.prototype
            && obj.prototype.constructor
            && obj.prototype.constructor.name !== "";
    }
}
