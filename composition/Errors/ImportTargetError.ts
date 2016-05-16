import {Constructor, ConstructorGuard} from "@ncorefx/fxcore";

import {ImportTarget} from "../ImportTarget";

/**
 * An error that describes a failed import.
 */
export class ImportTargetError extends Error {
    private _parameterIndex: number;
    
    /**
     * Initializes a new {ImportTargetError} object.
     * 
     * @param parameterIndex The index of the parameter that caused the import error.
     * @param importTarget An optional {ImportTarget} that caused the import error.
     * @parama innerError An optional {Error} that further describes the cause of the import error.
     */
    constructor(parameterIndex: number, importTarget?: ImportTarget, innerError?: Error) {
        let message = `${ImportTargetError.describeImportTargetError(importTarget)}`;
        
        if (innerError) {
            message += `\n${innerError.message}`;
        }
        
        super(message);
        
        this._parameterIndex = parameterIndex;
    }
    
    /**
     * Gets the index of the parameter that caused the import error.
     * 
     * @returns A number.
     */
    public get parameterIndex(): number {
        return this._parameterIndex;
    }
    
    /**
     * Generates an error message for a given import target.
     * 
     * @param importTarget An optional {ImportTarget} for which an error message is required.
     * 
     * @returns A string that describes the import target error for _importTarget_.
     */
    private static describeImportTargetError(importTarget?: ImportTarget): string {
        if (!importTarget) return "Unable to determine an import target.";
        
        if (ConstructorGuard.isConstructor(importTarget)) {
            return `Failed to get an export from import target '${importTarget.prototype.constructor.name}'.`;
        }
        else {
            return "Failed to get an export from export provider function.";
        }
    }
}
