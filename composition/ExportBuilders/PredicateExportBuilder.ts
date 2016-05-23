import {Constructor} from "@ncorefx/fxcore";

import {IExportProvider} from "../IExportProvider";

import {TypedExportBuilder} from "./TypedExportBuilder";

/**
 * Represents a rule for importing types that meet with a specified predicate function.
 */
export class PredicateExportBuilder extends TypedExportBuilder<any> {
    /**
     * Initializes a new {PredicateExportBuilder} object for a given predicate.
     *
     * @param predicateFunc A function that should return *true* if a reflection type meets with the
     * predicate.
     */
    constructor(protected predicateFunc: (reflectedTarget: Constructor<any>) => boolean) {
        super(100, undefined);
    }

    /**
     * Determines if a reflected type satifies the current rule by determining if the reflected
     * type meets with the predicate function.
     *
     * @param reflectedTarget The {Constructor} that should be tested against the current rule.
     *
     * @returns *true* if _reflectedTarget_ meets with the predicate function.
     */
    protected onMeetsContext(reflectedTarget: Constructor<any>): boolean {
        let isMatchingType = this.predicateFunc(reflectedTarget);

        return isMatchingType && this.isExportTargetOf(reflectedTarget);
    }
}
