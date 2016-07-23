import {ResourceManager} from "../ResourceManager";

import {SystemError} from "./SystemError";

export class InvalidOperationError extends SystemError {
    constructor(message?: string, innerError?: Error) {
        super(message, innerError);
    }
}