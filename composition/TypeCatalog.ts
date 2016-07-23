import {Constructor} from "@ncorefx/core";
import {TypeInfo} from "@ncorefx/reflection";

import {ComposableCatalog} from "./ComposableCatalog";
import {IReflectionContext} from "./IReflectionContext";

/**
 * Collects and returns exportable instances from a collection of supplied reflection types.
 */
export class TypeCatalog extends ComposableCatalog {
    /**
     * Initializes a new {TypeCatalog} object.
     *
     * @param exportedTypes An {Iterable} collection of {Constructor} objects that represent the
     * reflection types to include in this catalog.
     * @param reflectionContext An optional {IReflectionContext} implementation to apply to the reflected types.
     */
    constructor(protected exportedTypes: Iterable<Constructor<any>>, reflectionContext?: IReflectionContext) {
        super(reflectionContext);
    }

    /**
     * Enumerates the reflection types that were provided to the {TypeCatalog}.
     *
     * @param exportCallback A callback to invoke for each of the reflected types.
     */
    protected async onEnumerate(exportCallback: (targetOrModule: TypeInfo) => void): Promise<void> {
        for (let exportedType of this.exportedTypes) {
            exportCallback(new TypeInfo(exportedType));
        }
    }
}
