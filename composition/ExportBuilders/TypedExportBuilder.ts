import {Constructor, Lazy, memoize, reflect} from "@ncorefx/core";

import {TypeInfo} from "@ncorefx/reflection";

import {IExportProvider} from "../IExportProvider";
import {ILazyExport} from "../ILazyExport";
import {IMetadataProvider} from "../IMetadataProvider";
import {CreationPolicy} from "../CreationPolicy";
import {ImportTarget} from "../ImportTarget";

import {ExportBuilder} from "./ExportBuilder";
import {IExportBuilderFluentOptions,
       IExportBuilderFluentExportOptions,
       IExportBuilderFluentCreationOptions} from "./FluentInterface";
import {ReflectionExporter} from "./ReflectionExporter";
import {ExportTargetSet} from "./ExportTargetSet";

/**
 * Represents a rule for importing a reflection type and for optionally indicating
 * how that import should be exported and constructed.
 *
 * @typeparam T The reflection type that this rule is to be applied for.
 */
export abstract class TypedExportBuilder<T> extends ExportBuilder implements IExportBuilderFluentOptions<T> {
    /**
     * A metadata provider that provides access to metadata associated with the current rule.
     */
    private static MetadataProvider = class implements IMetadataProvider {
        private _targetType: TypeInfo;

        /**
         * Initializes a new {MetadataProvider} for the given reflected type.
         *
         * @param target The {Constructor} that represents the reflected type.
         * @param metadata The metadata that has been captured for the current rule.
         */
        constructor(targetType: TypeInfo, private metadata: Map<string, any>) {
            this._targetType = targetType;
        }

        /**
         * Returns the metadata for a given metadata key.
         *
         * @param metadataKey The key.
         *
         * @returns The metadata value that is associated with _key_; otherwise *undefined*.
         *
         * @remarks
         * Metadata for the current rule is given precedence over metadata that maybe exported from the
         * reflected type.
         */
        public getMetadata(metadataKey: string): any {
            return this.metadata.get(metadataKey) || reflect.getMetadata(metadataKey, this._targetType);
        }

        /**
         * Gets the reflected target that the metadata is associated with.
         *
         * @returns A {Constructor} that represents the reflected type.
         */
        public get targetType(): TypeInfo {
            return this._targetType;
        }
    }

    private _exportTargets: ExportTargetSet;
    private _importTargets: ImportTarget[];
    private _metadata: Map<string, any>;
    private _creationPolicy: CreationPolicy;
    private _builderFunc: (exportProvider: IExportProvider, target: TypeInfo, importTargets?: ImportTarget[]) => Promise<T>;

    /**
     * Initializes the base {TypedExportBuilder} object.
     *
     * @param assignedPriority The priority of the rule when compared to other rules. The higher the
     * prioity, the more precedence the rule has over other rules when considering a reflected type.
     * @param exportTarget The {Constructor} that represents the default export target for this
     * rule.
     */
    constructor(assignedPriority: number, exportTarget: TypeInfo) {
        super(assignedPriority);

        this._exportTargets = new ExportTargetSet([exportTarget]);
        this._importTargets = undefined;
        this._metadata = new Map<string, any>();
        this._creationPolicy = CreationPolicy.NonShared;
        this._builderFunc = ReflectionExporter.getExportedValue;
    }

    /**
     * Specifies the creation policy for instances that match the reflected type.
     *
     * @param creationPolicy The creation policy.
     */
    public setCreationPolicy(creationPolicy: CreationPolicy): void {
        this._creationPolicy = creationPolicy;
    }

    /**
     * Adds metadata to the matching reflected type.
     *
     * @param metadataKey The metadata key.
     * @param metadataValue The metadata value to store for the reflected type.
     */
    public addMetadata(metadataKey: string, metadataValue: any): IExportBuilderFluentExportOptions<T> {
        this._metadata.set(metadataKey, metadataValue);

        return this;
    }

    /**
     * Updates the current rule with the base types that are exportable.
     *
     * @param baseTargets An array of {Constructor} objects that represent the types that the reflected
     * type should be exported as.
     */
    public exportAs<TDerived>(...baseTargets: Constructor<TDerived>[]): IExportBuilderFluentCreationOptions<T> {
        if (!baseTargets || baseTargets.length === 0) return;

        this._exportTargets = new ExportTargetSet(baseTargets.map((baseTarget) => new TypeInfo(baseTarget)));

        return this;
    }

    /**
     * Updates the current rule with a function that will become responsible for creating instances of the
     * reflected type.
     *
     * @param builderFunc The function to invoke when an instance of the reflected type is
     * required.
     */
    public constructWith(builderFunc: (exportProvider: IExportProvider, target: TypeInfo) => Promise<T>): IExportBuilderFluentExportOptions<T> {
        this._builderFunc = builderFunc;

        // The user is specifying how to create this type of object. We must bump up the priority so that
        // it take precendence over any other rule
        this.assignedPriority = this.assignedPriority << 4;

        return this;
    }

    /**
     * Specifies the import targets to apply to the arguments of the reflected type's constructor when
     * creating instances of it.
     *
     * @param imports An array of {ImportTarget}.
     */
    public constructWithImports(...imports: ImportTarget[]): IExportBuilderFluentExportOptions<T> {
        this._importTargets = imports;

        // The user is specifying how to create this type of object. We must bump up the priority so that
        // it take precendence over any other rule
        this.assignedPriority = this.assignedPriority << 4;

        return this;
    }

    /**
     * Determienes if a reflection type is compatible with the export targets specified by the current
     * rule.
     *
     * @param target The {Constructor} that should be tested.
     *
     * @returns *true* if _target_ is one of the export targets specified by the current rule.
     */
    protected isExportTargetOf(target: TypeInfo): boolean {
        return this._exportTargets.isExportTarget(target);
    }

    /**
     * Retrieves an export from the current rule.
     *
     * @param reflectedTarget The {Constructor} that should be tested against the current rule.
     * @param exportTarget The {Constructor} that an export is required for.
     * @param exportProvider The export provider that can be used to retrieve further exports if they are
     * required by the export being requested.
     *
     * @returns A promise that yields an {ILazyExport} object for _exportTarget_ if it meets with the current
     * rule; otherwise *undefined*.
     */
    protected async onGetExport(reflectedTarget: TypeInfo, exportTarget: TypeInfo, exportProvider: IExportProvider): Promise<ILazyExport<T>> {
        if (reflectedTarget.typeConstructor !== exportTarget.typeConstructor 
            && !this._exportTargets.has(exportTarget)) return undefined;

        if (this._creationPolicy === CreationPolicy.NonShared) {
            let lazyExport: ILazyExport<T> = <any>new Lazy<T>(() => this._builderFunc(exportProvider, reflectedTarget, this._importTargets));

            lazyExport.metadata = new TypedExportBuilder.MetadataProvider(reflectedTarget, this._metadata);

            return lazyExport;
        }
        else {
            return this.createSharedExport(reflectedTarget, exportProvider, this._importTargets);
        }
    }

    /**
     * Creates a shared export for a given reflection type.
     *
     * @param reflectedTarget The {Constructor} for which a shared export is required.
     * @param exportProvider The export provider.
     * @param importTargets The import targets to use when importing any dependencies of _reflectedTarget_.
     *
     * @returns The singleton {ILazyExport} for _reflectedTarget_.
     *
     * @remarks
     * This method is a memoized function that returns the same export for _reflectedTarget_.
     */
    @memoize()
    private createSharedExport(reflectedTarget: TypeInfo, exportProvider: IExportProvider, importTargets: ImportTarget[]): ILazyExport<T> {
        let lazyExport: ILazyExport<T> = <any>new Lazy<T>(() => this._builderFunc(exportProvider, reflectedTarget, this._importTargets));

        lazyExport.metadata = new TypedExportBuilder.MetadataProvider(reflectedTarget, this._metadata);

        return lazyExport;
    }
}
