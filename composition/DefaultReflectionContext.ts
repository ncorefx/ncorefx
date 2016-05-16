import {Constructor, Lazy, memoize} from "@ncorefx/fxcore";

import {ReflectionExporter} from "./ExportBuilders/ReflectionExporter";
import {ExportTargetSet} from "./ExportBuilders/ExportTargetSet";

import {IExportProvider} from "./IExportProvider";
import {ILazyExport} from "./ILazyExport";
import {IMetadataProvider} from "./IMetadataProvider";
import {IReflectionContext} from "./IReflectionContext";
import {CreationPolicy} from "./CreationPolicy";

/**
 * The default reflection context.
 */
export class DefaultReflectionContext implements IReflectionContext {
    /**
     * The default metadata provider.
     */
    private static MetadataProvider = class implements IMetadataProvider {
        /**
         * Initializes a new {MetadataProvider} for the given reflected type.
         * 
         * @param target The {Constructor} that represents the reflected type.
         */
        constructor(private target: Constructor<any>) {
        }
        
        /**
         * Returns the metadata for a given metadata key.
         * 
         * @param metadataKey The key.
         * 
         * @returns The metadata value that is associated with _key_; otherwise *undefined*.
         */
        public getMetadata(metadataKey: string): any {
            return Reflect.getMetadata(metadataKey, this.target);
        }
    }
    
    /**
     * Determines if a reflected type satisfies the current reflection context.
     *
     * @param reflectedTarget The {Constructor} that should be tested against the current context.
     *
     * @returns *true* if _reflectedTarget_ satisfies the current context; otherwise *false*.
     *
     * @remarks
     * The {DefaultReflectionContext} class returns *true* for any reflection type.
     */
    public meetsContext(reflectedTarget: Constructor<any>): boolean {
        return true;
    }

    /**
     * Retrieves an export from the current reflection context.
     *
     * @param reflectedTarget The {Constructor} that should be tested against the current context.
     * @param exportTarget The {Constructor} that an export is required for.
     * @param exportProvider The export provider that can be used to retrieve further exports if they are
     * required by the export being requested.
     *
     * @returns A promise that yields an {ILazyExport} object for _exportTarget_ if it meets with the current
     * reflection context; otherwise *undefined*.
     */
    public async getExport(reflectedTarget: Constructor<any>, exportTarget: Constructor<any>, exportProvider: IExportProvider): Promise<ILazyExport<any>> {
        let exportTargets = <ExportTargetSet>Reflect.getOwnMetadata("ncorefx:composition:export-targets", reflectedTarget);

        if (!exportTargets.has(exportTarget) || !exportTargets.isExportTarget(reflectedTarget)) return undefined;
        
        let creationPolicy = <CreationPolicy>Reflect.getOwnMetadata("ncorefx:composition:export-creationpolicy", reflectedTarget) || CreationPolicy.NonShared; 

        if (creationPolicy === CreationPolicy.NonShared) {
            let lazyExport: ILazyExport<any> = <any>new Lazy<any>(() => ReflectionExporter.getExportedValue(exportProvider, reflectedTarget));
            
            lazyExport.metadata = new DefaultReflectionContext.MetadataProvider(reflectedTarget);
            
            return lazyExport;
        }
        else {
            return this.createSharedExport(reflectedTarget, exportProvider);
        }
    }
    
    /**
     * Creates a shared export for a given reflection type.
     *
     * @param reflectedTarget The {Constructor} for which a shared export is required.
     * @param exportProvider The export provider.
     * 
     * @returns The singleton {ILazyExport} for _reflectedTarget_.
     *
     * @remarks
     * This method is a memoized function that returns the same export for _reflectedTarget_.
     */
    @memoize()
    private createSharedExport(reflectedTarget: Constructor<any>, exportProvider: IExportProvider): ILazyExport<any> {
        let lazyExport: ILazyExport<any> = <any>new Lazy<any>(() => ReflectionExporter.getExportedValue(exportProvider, reflectedTarget));
        
        lazyExport.metadata = new DefaultReflectionContext.MetadataProvider(reflectedTarget);
        
        return lazyExport;
    }
}
