import {Constructor} from "@ncorefx/fxcore";

import {IExportProvider} from "../IExportProvider";

import {TypedExportBuilder} from "./TypedExportBuilder";

/**
 * Represents a rule for importing types that are derived from a specified reflection type.
 *
 * @typeparam T The reflection type that represents the reflection type that imports should
 * derive from.
 */
export class DerivedTypeExportBuilder<T> extends TypedExportBuilder<T> {
    /**
     * Initializes a new {DerivedTypeExportBuilder} object for a given base type.
     *
     * @param baseTarget The {Constructor} for _T_ that represents the reflection type
     * that imports should dervie from.
     */
    constructor(protected baseTarget: Constructor<T>) {
        super(200, baseTarget);
    }

    /**
     * Determines if a reflected type satifies the current rule by determining if the reflected
     * type is derived from the base type.
     *
     * @param reflectedTarget The {Constructor} that should be tested against the current rule.
     *
     * @returns *true* if _reflectedTarget_ is derived from the base type.
     */
    protected onMeetsContext(reflectedTarget: Constructor<any>): boolean {
        let isDerivedTarget = this.baseTarget.prototype.isPrototypeOf(reflectedTarget.prototype);

        return isDerivedTarget && this.isExportTargetOf(reflectedTarget);
    }
}
