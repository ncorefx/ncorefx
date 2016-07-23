import {Runtime, RuntimeType} from "@ncorefx/core";

if (Runtime.runtimeType === RuntimeType.browser) {
    let thisPackageMetadata = require("@ncorefx/composition/package.json");

    Runtime.registerPackage(thisPackageMetadata["name"], thisPackageMetadata, [ { cultureName: "en-US", strings: require("@ncorefx/composition/.resources/en-US/strings.json")} ]);
}

export * from "./Decorators";
export * from "./Errors";
export * from "./ExportBuilders";
export * from "./AggregateCatalog";
export * from "./ComposableCatalog";
export * from "./CompositionContainer";
export * from "./CreationPolicy";
export * from "./ExportProviderFunctions";
export * from "./IExportProvider";
export * from "./ILazyExport";
export * from "./IMetadataProvider";
export * from "./ImportTarget";
export * from "./IReflectionContext";
export * from "./ModuleCatalog";
export * from "./RegistrationBuilder";
export * from "./TypeCatalog";
