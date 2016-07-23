import {PackageDescriptor, ResourceStrings} from "./PackageDescriptor";

export interface IPackageSystem {
    register(packageName: string, packageMetadata: Object, resources?: ResourceStrings[]): void;

    getPackageDescriptor(packageName: string): PackageDescriptor;

    getResourceStrings(packageLocation: string, cultureName: string): Object;
}

export * from "./PackageDescriptor";
