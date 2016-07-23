import {TypeInfo} from "@ncorefx/reflection";

import {IReflectionContext} from "../IReflectionContext";
import {IExportProvider} from "../IExportProvider";
import {ILazyExport} from "../ILazyExport";

/**
 * Represents a rule for importing a reflection type.
 */
export abstract class ExportBuilder implements IReflectionContext {
    /**
     * Initializes the base {ExportBuilder} object.
     *
     * @param assignedPriority The priority of the rule when compared to other rules. The higher the
     * prioity, the more precedence the rule has over other rules when considering a reflected type.
     */
    constructor(protected assignedPriority: number) {
        this.assignedPriority = assignedPriority;
    }

    /**
     * Gets the priority of the current rule.
     */
    public get priority(): number {
        return this.assignedPriority;
    }

    /**
     * Determines if a reflected type satisfies the current rule.
     *
     * @param reflectedTarget The {Constructor} that should be tested against the current rule.
     *
     * @returns *true* if _reflectedTarget_ satisfies the current rule; otherwise *false*.
     */
    public meetsContext(reflectedTarget: TypeInfo): boolean
    {
        return this.onMeetsContext(reflectedTarget);
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
    public async getExport(reflectedTarget: TypeInfo, exportTarget: TypeInfo, exportProvider: IExportProvider): Promise<ILazyExport<any>> {
        return await this.onGetExport(reflectedTarget, exportTarget, exportProvider);
    }

    /**
     * Determines if a reflected type satisfies the current rule.
     *
     * @param reflectedTarget The {Constructor} that should be tested against the current rule.
     *
     * @returns *true* if _reflectedTarget_ satisfies the current rule; otherwise *false*.
     *
     * @remarks
     * Classes that derive from {ExportBuilder} must implement this method to provide their own logic
     * to determine whether a reflected type satisfies the current rule.
     */
    protected abstract onMeetsContext(reflectedTarget: TypeInfo): boolean;

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
     *
     * @remarks
     * Classes that derive from {ExportBuilder} must implement this method to provide their own logic
     * for exporting a reflected type.
     */
    protected abstract onGetExport(reflectedTarget: TypeInfo, exportTarget: TypeInfo,  exportProvider: IExportProvider): Promise<ILazyExport<any>>;
}
