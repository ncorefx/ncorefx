
/**
 * The error that is thrown when a method has no implementation.
 */
export class NotImplementedError extends Error {
    constructor(message: string) {
        super(message);
    }
}
