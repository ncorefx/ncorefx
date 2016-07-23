import {memoize} from "./MemoizeDecorator";

import {Constructor, ConstructorGuard} from "./Constructor";
import {ILazy} from "./ILazy";


/**
 * Provides support for lazy initialization.
 */
export class Lazy<T> implements ILazy<T> {
    private _initializationFunc: () => Promise<T>;

    /**
     * Initializes a new instance of the {Lazy} class. When lazily initialization occurs, the default
     * constructor of the target type is used.
     */
    constructor(target: Constructor<T>)
    /**
     * Initializes a new instance of the {Lazy} class. When lazily initialization occurs, the specified
     * initialization function is used.
     */
    constructor(initializationFunc: () => Promise<T>)
    constructor(p1: any) {
        if (ConstructorGuard.isConstructor<T>(p1)) {
            this._initializationFunc = async () => {
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
    public get value(): Promise<T> {
        return this._initializationFunc();
    }
}
