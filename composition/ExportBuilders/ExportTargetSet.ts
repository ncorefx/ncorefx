import {Constructor} from "@ncorefx/fxcore";

/**
 * Represents a set of reflected types that are the targets of exports.
 */
export class ExportTargetSet extends Set<Constructor<any>> {
    /**
     * Initializes a new {ExportTargetSet} object with a given set of reflected types.
     *
     * @param iterable An iterable collection of {Constructor} objects representing the set
     * of reflected types to be included.
     */
    constructor(iterable: Iterable<Constructor<any>>) {
        super(iterable);
    }

    /**
     * Determines if a reflected type is included in the current set of export targets.
     *
     * @param target The {Constructor} that should be tested.
     *
     * @returns *true* if _target_ is included in the current set of export targets; otherwise *false*.
     *
     * @remarks
     * To be considered an export target, _target_ will either be a member of the current set, or
     * derived from a member of the current set.
     */
    public isExportTarget(target: Constructor<any>): boolean {
        for (let exportTarget of this) {
            if (exportTarget === target || exportTarget.prototype.isPrototypeOf(target.prototype)) return true;
        }

        return false;
    }
}
