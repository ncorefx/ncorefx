import {Runtime, RuntimeType} from "@ncorefx/core";

if (Runtime.runtimeType === RuntimeType.browser) {
    let thisPackageMetadata = require("@ncorefx/reflection/package.json");

    Runtime.registerPackage(thisPackageMetadata["name"], thisPackageMetadata);
}

export * from "./Errors";
export * from "./Activator";
export * from "./MethodInfo";
export * from "./ModuleInfo";
export * from "./PackageInfo";
export * from "./TypeInfo";
