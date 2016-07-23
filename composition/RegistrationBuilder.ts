import {Constructor} from "@ncorefx/core";
import {TypeInfo} from "@ncorefx/reflection";

import {ExportBuilder} from "./ExportBuilders/ExportBuilder";
import {IExportBuilderFluentOptions} from "./ExportBuilders/FluentInterface";
import {DerivedTypeExportBuilder} from "./ExportBuilders/DerivedTypeExportBuilder";
import {TypeExportBuilder} from "./ExportBuilders/TypeExportBuilder";
import {PredicateExportBuilder} from "./ExportBuilders/PredicateExportBuilder";

import {IExportProvider} from "./IExportProvider";
import {ILazyExport} from "./ILazyExport";
import {IReflectionContext} from "./IReflectionContext";

/**
 * Represents a reflection context that has associated conventions that describes rules for importing
 * reflection types.
 */
export class RegistrationBuilder implements IReflectionContext {
    private _exportBuilders: Set<ExportBuilder>;

    /**
     * Initializes a new instance of the {RegistrationBuilder} class.
     */
    constructor() {
        this._exportBuilders = new Set<ExportBuilder>();
    }

    /**
     * Gets an object that represents a rule for importing a specific reflection type.
     *
     * @typeparam T The reflection type for which the rule is required.
     * @param target The {Constructor} for _T_.
     *
     * @returns An object that represents the rule.
     */
    public forType<T>(target: Constructor<T>): IExportBuilderFluentOptions<T> {
        let exportBuilder = new TypeExportBuilder<T>(new TypeInfo(target));

        this._exportBuilders.add(exportBuilder);

        return exportBuilder;
    }

    /**
     * Gets an object that represents a rule for importing all types that derive from the specified
     * reflection type, but not applicable to the specified reflection type.
     *
     * @typeparam T The reflection type for which the rule is required.
     * @param baseTarget The {Constructor} for _T_.
     *
     * @returns An object that represents the rule.
     */
    public forTypesDerivedFrom<T>(baseTarget: Constructor<T>): IExportBuilderFluentOptions<T> {
        let exportBuilder = new DerivedTypeExportBuilder<T>(new TypeInfo(baseTarget));

        this._exportBuilders.add(exportBuilder);

        return exportBuilder;
    }

    /**
     * Gets an object that represents a rule for importing all types that meet with the specified
     * predicate function.
     *
     * @param predicateFunc A function that should return *true* if a reflection type meets with the
     * predicate.
     *
     * @returns An object that represents the rule.
     */
    public forTypesMatching(predicateFunc: (reflectedTarget: TypeInfo) => boolean): IExportBuilderFluentOptions<any> {
        let exportBuilder = new PredicateExportBuilder(predicateFunc);

        this._exportBuilders.add(exportBuilder);

        return exportBuilder;
    }

    /**
     * Determines if a reflected type satisfies the current reflection context.
     *
     * @param reflectedTarget The {Constructor} that should be tested against the current context.
     *
     * @returns *true* if _reflectedTarget_ satisfies the current context; otherwise *false*.
     */
    public meetsContext(reflectedTarget: TypeInfo): boolean {
        for (let exportBuilder of this._exportBuilders) {
            if (exportBuilder.meetsContext(reflectedTarget)) {
                return true;
            }
        }

        return false;
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
    public async getExport(reflectedTarget: TypeInfo, exportTarget: TypeInfo, exportProvider: IExportProvider): Promise<ILazyExport<any>> {
        let exportBuilders: ExportBuilder[] = [];

        for (let exportBuilder of this._exportBuilders) {
            if (exportBuilder.meetsContext(reflectedTarget)) {
                exportBuilders.push(exportBuilder);
            }
        }

        if (exportBuilders.length === 0) return undefined;

        exportBuilders.sort((a, b) => b.priority - a.priority);

        return await exportBuilders[0].getExport(reflectedTarget, exportTarget, exportProvider);
    }
}
