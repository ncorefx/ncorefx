import {memoize, ConstructorGuard} from "@ncorefx/core";

import {TypeInfo} from "./TypeInfo";
import {MethodInfo} from "./MethodInfo";

/**
 * Provides information about an executable module.
 */
export class ModuleInfo {
    private _moduleExports: any;

    /**
     * Initializes a new {ModuleInfo} object for a given set of exports.
     * 
     * @param moduleExports An optional object that represents the exports that should be enumerated by the
     * created {ModuleInfo}.
     * 
     * @remarks
     * _moduleExports_ would normally be the result of a call to `require()`, however, derived classes of {ModuleInfo}
     * can specify *undefined* and then override {ModuleInfo#onGetModuleExports} to return the exports.
     */
    constructor(moduleExports?: any) {
        this._moduleExports = moduleExports;
    }

    public get types(): Set<TypeInfo> {
        return this.getTypes();
    }

    public get methods(): Set<MethodInfo> {
        return this.getMethods();
    }

    /**
     * Returns the exports that should be enumerated by the current {ModuleInfo}.
     * 
     * @returns An `any` value that represents the exports.
     * 
     * @remarks
     * {ModuleInfo#onGetModuleExports} should be overriden in derived classes if they do not supply the module
     * exports when initializing the base {ModuleInfo} object.
     */
    protected onGetModuleExports(): any {
        return this._moduleExports;
    }

    /**
     * Returns the exports that should be enumerated by the current {ModuleInfo}.
     * 
     * @returns An `any` value that represents the exports.
     */
    private getModuleExports(): any {
        return this.onGetModuleExports();
    }

    @memoize()
    private getTypes(): Set<TypeInfo> {
        let types = new Set<TypeInfo>();

        let moduleExports = this.getModuleExports();

        if (ConstructorGuard.isConstructor(moduleExports)) {
            types.add(new TypeInfo(moduleExports));

            return types;
        }

        for (let exportKey in moduleExports) {
            let exportedValue = moduleExports[exportKey];

            if (ConstructorGuard.isConstructor(exportedValue)) {
                types.add(new TypeInfo(exportedValue));
            }
        }

        return types;
    }

    @memoize()
    private getMethods(): Set<MethodInfo> {
        let methods = new Set<MethodInfo>();

        let moduleExports = this.getModuleExports();

        if (typeof moduleExports === "function") {
            methods.add(new MethodInfo(moduleExports));

            return methods;
        }

        for (let exportKey in moduleExports) {
            let exportedValue = moduleExports[exportKey];

            if (typeof exportedValue === "function") {
                methods.add(new MethodInfo(exportedValue));
            }
        }

        return methods;
    }
}
