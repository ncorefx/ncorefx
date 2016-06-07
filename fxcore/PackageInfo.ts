import {nodeGuard} from "./Decorators/NodeGuardDecorator";

import {NotImplementedError} from "./Errors/NotImplementedError";

import {SyncLazy} from "./SyncLazy";

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
    private _packageData: SyncLazy<any>;

    /**
     * Initializes a new {PackageInfo} object for the given path.
     *
     * @param packageJsonPath A path to a 'package.json' file.
     */
    constructor(packageJsonPath: string) {
        this._locationPath = packageJsonPath.substring(0, packageJsonPath.length - 13);
        this._packageData = new SyncLazy<any>(this.loadPackageData.bind(this));
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
     * Gets the name of the package.
     *
     * @returns A string representing the name of the package.
     */
    public get name(): string {
        return this._packageData.value["name"];
    }

    /**
     * Gets the description of the package.
     *
     * @returns A string representing the description of the package.
     */
    public get description(): string {
        return this._packageData.value["description"];
    }

    /**
     * Gets the version of the package.
     *
     * @returns A string representing the version of the package.
     */
    public get version(): string {
        return this._packageData.value["version"];
    }

    /**
     * Gets the 'main' property of the package.
     *
     * @returns A string representing the 'main' property of the package.
     */
    public get main(): string {
        return this._packageData.value["main"] || "./index.js";
    }

    /**
     * Gets the 'dependencies' property of the package.
     *
     * @returns A string representing the 'dependencies' property of the package.
     */
    public get dependencies(): Object {
        return this._packageData.value["dependencies"];
    }

    /**
     * Loads the contents of the 'package.json' file.
     *
     * @returns An object defining the properties contained in the represented 'package.json' file.
     */
    @nodeGuard()
    private loadPackageData(): Object {
        return require(path.join(this._locationPath, "package.json"));
    }

    private loadPackageData_Browser(): Object {
        // In a Browser runtime, loadPackageData() is not used.
        // See: PackageInfo#getEntryPackage_Browser() for more details.
        return undefined;
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
        let packageData = Reflect.getMetadata("ncorefx:packages:entry-package", window);
        let packageInfo = new PackageInfo(packageData.location);

        packageInfo._packageData = new SyncLazy<any>(() => packageData.packageData);

        return packageInfo;
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

            if (stackFrameFilename.indexOf("PackageInfo") < 0
                && stackFrameFilename.indexOf("NodeGuard") < 0
                && stackFrameFilename.indexOf("ResourceManager") < 0) break;
        }

        return stackFrameFilename
            ? PackageInfo.findPackageForPath(path.dirname(stackFrameFilename))
            : undefined;
    }

    private static getExecutingPackage_Browser(filename?: string): PackageInfo {
        throw new NotImplementedError("PackageInfo#getExecutingPackage is not supported in a Browser runtime.");
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

    /**
     * Returns the root module.
     *
     * @currentModule The current module.
     *
     * @returns The {NodeModule} found at the root by walking up the module hierarchy.
     */
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
