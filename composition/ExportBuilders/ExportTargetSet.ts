import {Constructor} from "@ncorefx/core";
import {TypeInfo} from "@ncorefx/reflection";

/**
 * Represents a set of reflected types that are the targets of exports.
 */
export class ExportTargetSet {
    private _exportSet: Set<Constructor<any>>;

    /**
     * Initializes a new {ExportTargetSet} object with a given set of reflected types.
     *
     * @param iterable An iterable collection of {Constructor} objects representing the set
     * of reflected types to be included.
     */
    constructor(iterable: Iterable<TypeInfo>) {
        this._exportSet = new Set<Constructor<any>>([...iterable].map((typeInfo) => typeInfo.typeConstructor));
    }

    /**
     * Determines if a target type is contained in the current export targets.
     * 
     * @param targetType The {TypeInfo} to test for.
     * 
     * @returns `true` if _targetType_ is defined in the current export targets; otherwise `false`.
     */
    public has(targetType: TypeInfo): boolean {
        for (let currentType of this._exportSet) {
            if (targetType.typeConstructor === currentType) return true;
        }

        return false;
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
    public isExportTarget(targetType: TypeInfo): boolean {
        for (let currentType of this._exportSet) {
            if (targetType.typeConstructor === currentType
                || targetType.isDerivedFrom(new TypeInfo(currentType))) return true;
        }

        return false;
    }
}
