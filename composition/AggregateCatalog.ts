import {ComposableCatalog} from "./ComposableCatalog";
import {IReflectionContext} from "./IReflectionContext";

/**
 * A catalog that collects and returns the combined exportable instances from the reflection types collected by
 * an aggregate of other catalogs.
 */
export class AggregateCatalog extends ComposableCatalog {
    /**
     * Initializes a new {AggregateCatalog} object with the specified catalogs.
     *
     * @param catalogs A set of {ComposableCatalog} objects that will be used to collection reflection
     * types as an aggregate.
     * @param reflectionContext An optional {IReflectionContext} implementation to apply to the reflected types.
     */
    constructor(protected catalogs: Set<ComposableCatalog>, reflectionContext?: IReflectionContext) {
        super(reflectionContext);
    }

    /**
     * Enumerates the reflection types that are collected from the aggregate of the other catalogs.
     *
     * @param exportCallback A callback to invoke for each of the reflected types.
     */
    protected async onEnumerate(exportCallback: (exportedModule: any) => void): Promise<void> {
        for (let catalog of this.catalogs) {
            let catalogExports = await catalog.getReflectionTargets();

            for (let catalogExport of catalogExports) {
                exportCallback(catalogExport);
            }
        }
    }
}
