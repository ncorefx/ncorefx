import {Runtime, RuntimeType, reflect, getPathSystem, ILocationPathProvider, packageSys, LazySync} from "@ncorefx/core";
import {ModuleInfo} from "./ModuleInfo";
import {PackageNotFoundError} from "./Errors";

/**
 * Provides information about a package.
 */
export class PackageInfo extends ModuleInfo implements ILocationPathProvider {
    private _packageLocation: string;
    private _packageMetadata: LazySync<any>;

    /**
     * Initializes a new {PackageInfo} object for the given path.
     *
     * @param packageJsonPath A path to a 'package.json' file.
     */
    constructor(packageJsonFilePath: string) {
        let matches = /(.*)\/package\.json/i.exec(packageJsonFilePath);

        if (!matches) throw new Error();

        super();

        this._packageLocation = matches[1];
    }

    /**
     * Gets the location of the package.
     *
     * @returns The path that contains the associated 'package.json' file.
     */
    public get location(): string {
        return this._packageLocation;
    }

    /**
     * Gets the name of the package.
     *
     * @returns A string representing the name of the package.
     */
    public get name(): string {
        return this._packageMetadata.value["name"];
    }

    /**
     * Gets the description of the package.
     *
     * @returns A string representing the description of the package.
     */
    public get description(): string {
        return this._packageMetadata.value["description"];
    }

    /**
     * Gets the version of the package.
     *
     * @returns A string representing the version of the package.
     */
    public get version(): string {
        return this._packageMetadata.value["version"];
    }

    /**
     * Gets the 'main' property of the package.
     *
     * @returns A string representing the 'main' property of the package.
     */
    public get main(): string {
        return this._packageMetadata.value["main"] || "./index.js";
    }

    /**
     * Gets the 'dependencies' property of the package.
     *
     * @returns A dictionary like object representing the 'dependencies' property of the package.
     */
    public get dependencies(): { [dependencyName: string]: string } {
        return this._packageMetadata.value["dependencies"];
    }

    /**
     * Gets a flag that indicates whether this package is scoped.
     * 
     * @returns *true* if the package is scoped; otherwise *false*.
     */
    public get isScoped(): boolean {
        return /^\@.*\/.*$/.exec(this.name) !== undefined;
    }

    /**
     * Override of {ModuleInfo#onGetModuleExports} that returns the exports from the package.
     * 
     * @returns An `any` value that represents the exports.
     */
    protected onGetModuleExports(): any {
        return require(this.main);
    }

    public static getNamedPackage(packageName: string): PackageInfo {
        if (Runtime.runtimeType === RuntimeType.node) {
            try {
                let packageInfo = new PackageInfo(require.resolve(getPathSystem().join(packageName, "package.json")));

                packageInfo._packageMetadata = new LazySync<any>(() => require.resolve(getPathSystem().join(packageName, "package.json")));

                return packageInfo;
            }
            catch (error) {
                throw new PackageNotFoundError(packageName, error);
            }
        }

        return PackageInfo.getNamedReflectedPackage(packageName);
    } 

    private static getNamedReflectedPackage(packageName: string): PackageInfo {
        let packageDescriptor = packageSys.getPackageDescriptor(packageName);

        if (!packageDescriptor) throw new PackageNotFoundError(packageName);

        let packageInfo = new PackageInfo(packageDescriptor.location);

        packageInfo._packageMetadata = new LazySync<any>(() => packageDescriptor.packageMetadata);

        return packageInfo;
    }
}