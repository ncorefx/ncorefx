import "./System";

import {Runtime, RuntimeType, IPathSystem, getPathSystem, ICryptoSystem, getCryptoSystem, IOSSystem, getOSSystem} from "@ncorefx/core";

if (Runtime.runtimeType === RuntimeType.browser) {
    let thisPackageMetadata = require("@ncorefx/react-native-core/package.json");

    Runtime.registerPackage(thisPackageMetadata["name"], thisPackageMetadata);
}

export const path = getPathSystem();
export const crypto = getCryptoSystem();
export const os = getOSSystem();

export {
    ResourceStrings,
    ConstructorGuard,
    Constructor,
    Context,
    CultureContext,
    CultureInfo,
    ResourceManager,
    Runtime,
    RuntimeType
} from "@ncorefx/core";

export * from "./Application";
