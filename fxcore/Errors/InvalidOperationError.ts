
/**
 * The error that is thrown when a method call is invalid for an object's current
 * state.
 */
export class InvalidOperationError extends Error {
    constructor(message: string) {
        super(message);
    }
}
