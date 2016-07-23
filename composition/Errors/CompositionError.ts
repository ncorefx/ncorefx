import {Constructor, InvalidOperationError, ResourceManager} from "@ncorefx/core";
import {PackageInfo, TypeInfo} from "@ncorefx/reflection";

import {ImportTargetError} from "./ImportTargetError";

/**
 * The error that occurs when an export cannot be composed in a composition container object.
 */
export class CompositionError extends InvalidOperationError {
    private _importTargetErrors: Set<ImportTargetError>;

    /**
     * Initializes a new {CompositionError} object for a given reflection type with the errors that
     * caused the composition to fail.
     *
     * @param target A {Constructor} that represents the reflected type that has failed to compose.
     * @param importTargetErrors An iterable collection of {ImportTargetError} objects.
     */
    constructor(targetType: TypeInfo, importTargetErrors: Iterable<ImportTargetError>) {
        let resources = new ResourceManager(PackageInfo.getNamedPackage("@ncorefx/composition"));

        let message = resources.getFormattedString("compositionFailure", {"typeName": targetType.name});

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
