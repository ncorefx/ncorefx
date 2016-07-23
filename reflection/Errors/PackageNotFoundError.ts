import {ResourceManager, SystemError} from "@ncorefx/core";

export class PackageNotFoundError extends SystemError {
    constructor(packageName?: string, innerError?: Error) {
        let message = new ResourceManager({location: "@ncorefx/reflection"}).getFormattedString("missingPackage", {"packageName": packageName});

        super(message, innerError);
    }
}
