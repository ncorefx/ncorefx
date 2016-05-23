import {Constructor} from "@ncorefx/fxcore";

import {CompositionContainer} from "../CompositionContainer"; 

import {ImportTargetError} from "./ImportTargetError";

/**
 * The error that occurs when an export cannot be composed in a {CompositionContainer} object.
 */
export class CompositionError extends Error {
    private _importTargetErrors: Set<ImportTargetError>;
    
    /**
     * Initializes a new {CompositionError} object for a given reflection type with the errors that
     * caused the composition to fail.
     * 
     * @param target A {Constructor} that represents the reflected type that has failed to compose.
     * @param importTargetErrors An iterable collection of {ImportTargetError} objects.
     */
    constructor(target: Constructor<any>, importTargetErrors: Iterable<ImportTargetError>) {
        let message = `Unable to compose an export for '${target.prototype.constructor.name}'\nParameter import errors:`;
        
        for (let importTargetError of importTargetErrors) {
            message += `\n<${importTargetError.parameterIndex}>: ${importTargetError.message.replace(/\n/g, "\n      ")}`;
        }
        
        super(message);
        
        this._importTargetErrors = new Set<ImportTargetError>(importTargetErrors);
    }
    
    /**
     * Gets the import target errors that caused composition to fail.
     * 
     * @returns A set of {ImportTargetError} objects that describe the errors that caused the composition to
     * fail.
     */
    public get errors(): Set<ImportTargetError> {
        return this._importTargetErrors;
    }
}
