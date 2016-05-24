import {Constructor} from "./CoreTypes";

/**
 * Encapsulates a collection of context objects with reference counting semantics.
 */
export class ZoneContext extends Map<Constructor<any>, Object> {
    private _refCount: number;

    /**
     * Initializes a new {ZoneContext} object.
     *
     * @param contextObjects A set of objects that are part of the current context.
     */
    constructor(contextObjects?: Iterable<[Constructor<any>, Object]>) {
        super(contextObjects);

        this._refCount = 0;
    }

    /**
     * Increments the reference count.
     *
     * @returns A number indicating the new reference count.
     */
    public addRef(): number
    {
        return ++this._refCount;
    }

    /**
     * Decrements the reference count.
     *
     * @returns A number indicating the new reference count.
     *
     * @remarks
     * If the reference count is decremented to zero then any 'dispose' action is invoked on
     * the context objects.
     */
    public release(): number
    {
        this._refCount--;

        if (this._refCount === 0)
        {
            for (let contextObjectKeyValue of this.entries())
            {
                let contextObject = contextObjectKeyValue[1];

                if (contextObject["dispose"])
                {
                    contextObject["dispose"]();
                }
            }
        }

        return this._refCount;
    }
};