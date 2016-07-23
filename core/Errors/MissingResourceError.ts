import {SystemError} from "./SystemError";

export class MissingResourceError extends SystemError {
    constructor(message?: string, innerError?: Error) {
        super(message, innerError);
    }
}
