import {InvalidOperationError} from "./InvalidOperationError";

/**
 * The error that is thrown a package does not contain the requested resource.
 */
export class MissingResourcesError extends InvalidOperationError {
    constructor(message: string) {
        super(message);
    }
}
