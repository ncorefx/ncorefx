import {nodeGuard} from "./Decorators/NodeGuardDecorator";

import * as path from "path";
import * as fs from "fs";

/**
 * Provides access to a 'package.json' file.
 */
export class PackageInfo {
    /**
     * Captures the current call site.
     */
    private static CallSite = class {
        private _stackFrames: any[];

        /**
         * Initializes a new {PackageInfo.CallSite} object.
         */
        constructor() {
            var currentPrepareStackTraceFunc = (<any>Error).prepareStackTrace;

            (<any>Error).prepareStackTrace = function(_, stack){ return stack; };

            var dummyError = new Error;

            (<any>Error).captureStackTrace(dummyError);

            this._stackFrames = (<any>dummyError).stack;

            (<any>Error).prepareStackTrace = currentPrepareStackTraceFunc;
        }

        /**
         * Gets the stackframes that are associated with this call site.
         *
         * @returns An array of stack frames.
         */
        public get stackFrames(): any[] {
            return this._stackFrames;
        }
    };

    private _locationPath: string;

    /**
     * Initializes a new {PackageInfo} object for the given path.
     *
     * @param packageJsonPath A path to a 'package.json' file.
     */
    constructor(packageJsonPath: string) {
        this._locationPath = path.dirname(packageJsonPath);
    }

    /**
     * Gets the location of the package.
     *
     * @returns The path that contains the associated 'package.json' file.
     */
    public get location(): string {
        return this._locationPath;
    }

    /**
     * Gets the package representing the root of the executing code.
     *
     * @returns A {PackageInfo} object representing the root package.
     */
    @nodeGuard()
    public static getEntryPackage(): PackageInfo {
        return PackageInfo.findPackageForPath(path.dirname(PackageInfo.getRootModulePath(module)));
    }

    private static getEntryPackage_Browser(): PackageInfo {
        return undefined;
    }

    /**
     * Gets the package that contains the code that is currently executing.
     *
     * @param filename An optional filename that is used to help determine the executing code.
     *
     * @returns A {PackageInfo} object representing the package that contains the executing code.
     *
     * @remarks
     * _filename_ is not required when executing in a Node runtime since the callsite can be examined.
     * It is required in a Browser runtime however because the filename will be looked up in the
     * bundle metadata to determine the associated package.
     */
    @nodeGuard()
    public static getExecutingPackage(filename?: string): PackageInfo {
        if (filename) return PackageInfo.findPackageForPath(path.parse(filename).dir);

        let callsite = new PackageInfo.CallSite();

        let stackFrameFilename: string;

        for (let idx = 0; idx < callsite.stackFrames.length; idx++) {
            stackFrameFilename = callsite.stackFrames[idx].getFileName();

            if (stackFrameFilename.indexOf("PackageInfo") < 0 && stackFrameFilename.indexOf("NodeGuard") < 0) break;
        }

        return stackFrameFilename
            ? PackageInfo.findPackageForPath(path.dirname(stackFrameFilename))
            : undefined;
    }

    private static getExecutingPackage_Browser(filename?: string): PackageInfo {
        return undefined;
    }

    /**
     * Finds the {PackageInfo} object for the given target path, walking up through the parent folder hierarchy
     * as required to find the nearest 'package.json'.
     *
     * @param targetPath The target path from which the search should start.
     *
     * @returns The nearest {PackageInfo} for _targetPath_. If no 'package.json' file could be found, then
     * *undefined* is returned.
     */
    private static findPackageForPath(targetPath: string): PackageInfo {
        let currentPath: string = undefined;

        while (targetPath != currentPath) {
            let packageJsonPath = path.join(targetPath, "package.json");

            if (fs.existsSync(packageJsonPath)) return new PackageInfo(packageJsonPath);

            currentPath = targetPath;

            targetPath = path.join(currentPath, "..");
        }

        return undefined;
    }

    private static getRootModulePath(currentModule: NodeModule): string {
        if (currentModule.parent === null)
        {
            var parsedPath = path.parse(currentModule.filename);

            // If we're running in the context of iisnode on Windows, then return the current working directory
            return parsedPath.name === "interceptor" ? process.cwd() : parsedPath.dir;
        }

        return PackageInfo.getRootModulePath(currentModule.parent);
    }
}
