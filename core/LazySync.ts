import {memoize} from "./MemoizeDecorator";

import {Constructor, ConstructorGuard} from "./Constructor";
import {ILazySync} from "./ILazySync";

/**
 * Provides support for lazy initialization.
 */
export class LazySync<T> implements ILazySync<T> {
    private _initializationFunc: () => T;

    /**
     * Initializes a new instance of the {Lazy} class. When lazily initialization occurs, the default
     * constructor of the target type is used.
     */
    constructor(target: Constructor<T>)
    /**
     * Initializes a new instance of the {Lazy} class. When lazily initialization occurs, the specified
     * initialization function is used.
     */
    constructor(initializationFunc: () => T)
    constructor(p1: any) {
        if (ConstructorGuard.isConstructor<T>(p1)) {
            this._initializationFunc = () => {
                return new p1();
            }
        }
        else {
            this._initializationFunc = p1;
        }
    }

    /**
     * Gets the lazily initiated value of the current {Lazy} object.
     */
    @memoize()
    public get value(): T {
        return this._initializationFunc();
    }
}
