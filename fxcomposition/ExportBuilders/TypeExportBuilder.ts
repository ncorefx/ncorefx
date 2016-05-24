import {Constructor} from "@ncorefx/fxcore";

import {IExportProvider} from "../IExportProvider";

import {TypedExportBuilder} from "./TypedExportBuilder";

/**
 * Represents a rule for importing types that is a specific reflection type.
 *
 * @typeparam T The reflection type that represents the specific type that is required.
 */
export class TypeExportBuilder<T> extends TypedExportBuilder<T> {
    /**
     * Initializes a new {TypeExportBuilder} object for the given type.
     *
     * @param target The {Constructor} for _T_ that represents the specific type that is required.
     */
    constructor(protected target: Constructor<T>) {
        super(300, target);
    }

    /**
     * Determines if a reflected type satifies the current rule by determining if the reflected
     * type is the specified type.
     *
     * @param reflectedTarget The {Constructor} that should be tested against the current rule.
     *
     * @returns *true* if _reflectedTarget_ is the specified type.
     */
    protected onMeetsContext(reflectedTarget: Constructor<any>): boolean {
        let isType = this.target === reflectedTarget;

        return isType && this.isExportTargetOf(reflectedTarget);
    }
}
