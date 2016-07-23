import {IPackageSystem, PackageDescriptor, ResourceStrings} from "./IPackageSystem";
import {getPathSystem, reflect} from "./System";

export class PackageSystem implements IPackageSystem {
    public register(packageName: string, packageMetadata: Object, resources?: ResourceStrings[]): void {
        let packages = <Map<string, PackageDescriptor>>reflect.getOwnMetadata("corefx:packages", window || global);

        if (!packages) {
            packages = new Map<string, PackageDescriptor>();
        }

        let resourcesMap: Map<string, ResourceStrings> = undefined;

        if (resources) {
            resourcesMap = new Map<string, ResourceStrings>();
            
            for (let resource of resources) {
                resourcesMap.set(resource.cultureName, resource);
            }
        }

        packages.set(packageName, {
            location: `${packageName}/package.json`,
            packageMetadata: packageMetadata,
            resources: resourcesMap
        });

        reflect.defineMetadata("corefx:packages", packages, window || global);
    }

    public getPackageDescriptor(packageName: string): PackageDescriptor {
        let packages = <Map<string, PackageDescriptor>>reflect.getOwnMetadata("corefx:packages", window || global);

        if (!packages) return undefined;

        return packages.get(packageName);        
    }

    public getResourceStrings(packageLocation: string, cultureName: string): Object {
        try {
            return require(getPathSystem().join(packageLocation, ".resources", cultureName, "strings.json"));
        }
        catch (error) {
            return undefined;
        }
    }
}

export * from "./IPackageSystem";
