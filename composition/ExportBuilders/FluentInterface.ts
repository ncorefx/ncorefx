import {Constructor} from "@ncorefx/core";

import {TypeInfo} from "@ncorefx/reflection";

import {IExportProvider} from "../IExportProvider";
import {CreationPolicy} from "../CreationPolicy";
import {ImportTarget} from "../ImportTarget";

/**
 * Fluent interface for defining creation policy rules.
 */
export interface IExportBuilderFluentCreationOptions<T> {
    /**
     * Specifies the creation policy for instances that match the reflected type.
     *
     * @param creationPolicy The creation policy.
     */
    setCreationPolicy(creationPolicy: CreationPolicy): void;
}

/**
 * Fluent interface for defining export rules.
 */
export interface IExportBuilderFluentExportOptions<T>
{
    /**
     * Adds metadata to the matching reflected type.
     *
     * @param metadataKey The metadata key.
     * @param metadataValue The metadata value to store for the reflected type.
     */
    addMetadata(metadataKey: string, metadataValue: any): IExportBuilderFluentExportOptions<T>;

    /**
     * Exports the reflected type by one or more of its base types.
     *
     * @param baseTargets An array of {Constructor} objects that represent the types that the reflected
     * type should be exported as.
     */
    exportAs<TBase>(...baseTargets: Constructor<TBase>[]): IExportBuilderFluentCreationOptions<T>;
}

/**
 * Fluent interface for defining export and construction rules.
 */
export interface IExportBuilderFluentOptions<T> extends IExportBuilderFluentExportOptions<T>//, IExportBuilderFluentCreationOptions<T>
{
    /**
     * Defines a function that will become responsible for creating instances of the reflected type.
     *
     * @param builderFunc The function to invoke when an instance of the reflected type is
     * required.
     */
    constructWith(builderFunc: (exportProvider: IExportProvider, target: TypeInfo) => Promise<T>): IExportBuilderFluentExportOptions<T>;

    /**
     * Specifies the import targets to apply to the arguments of the reflected type's constructor when
     * creating instances of it.
     *
     * @param imports An array of {ImportTarget}.
     */
    constructWithImports(...imports: ImportTarget[]): IExportBuilderFluentExportOptions<T>;
}
