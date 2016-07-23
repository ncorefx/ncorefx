import {ModuleInfo} from "@ncorefx/reflection";

import {ComposableCatalog} from "./ComposableCatalog";
import {IReflectionContext} from "./IReflectionContext";

/**
 * Collects and returns exportable instances from a given module.
 */
export class ModuleCatalog extends ComposableCatalog {
    /**
     * Initializes a new {ModuleCatalog} object.
     * 
     * @param exportedModule A {ModuleInfo} that represents an exported module.
     * @param reflectionContext An optional {IReflectionContext} implementation to apply to the reflected types.
     */
    constructor(protected exportedModule: ModuleInfo, reflectionContext?: IReflectionContext) {
        super(reflectionContext);
    }

    /**
     * Enumerates the reflection types that are contained in the provided {ModuleInfo}.
     *
     * @param exportCallback A callback to invoke for the module.
     */
    protected async onEnumerate(exportCallback: (targetOrModule: ModuleInfo) => void): Promise<void> {
        exportCallback(new ModuleInfo(this.exportedModule));
    }
}
