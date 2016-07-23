export type ResourceStrings = { 
    cultureName: string;
    strings: Object | string
}

export interface PackageDescriptor {
    location: string;

    packageMetadata: Object;

    resources: Map<string, ResourceStrings>;
}
