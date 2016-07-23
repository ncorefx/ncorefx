
/**
 * Serves as the base class for system errors.
 */
export abstract class SystemError extends Error {
    private _innerError: Error;

    /**
     * Initializes the base {SystemError} object.
     * 
     * @param message The error message that explains the reason for the error.
     * @param innerError The error that is the cause of the current error.  
     */
    constructor(message?: string, innerError?: Error) {
        super();
    }

    /**
     * Gets the error object that caused the current error.
     * 
     * @returns An {Error} object.
     */
    private get innerError(): Error {
        return this._innerError;
    }
}
