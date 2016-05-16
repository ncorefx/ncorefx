import {Constructor} from "@ncorefx/fxcore";

/**
 * The error that is thrown when the cardinality of an import is not compatible with
 * the cardinality of the associated exports.
 */
export class ImportCardinalityMismatchError extends Error {
    private _targetInError: Constructor<any>;

    /**
     * Initializes a new {ImportCardinalityMismatchError} object.
     *
     * @param target The {Constructor} representing the reflection type that caused the error.
     */
    constructor(target: Constructor<any>) {
        super(`There are zero or more than one exports that meet the import of '${target.prototype.constructor.name}'.`);

        this._targetInError = target;
    }

    /**
     * Gets the reflection type that caused the cardinality error.
     *
     * @returns A {Constructor}.
     */
    public get target(): Constructor<any> {
        return this._targetInError;
    }
}
