import "./reflect-metadata";

import {Runtime} from "./Runtime";
import {RuntimeType} from "./RuntimeType";
import * as lodash from "lodash";

if (process && process.env && !process.env.COREFX_CORE__NO_ZONES) {
    require("zone.js");
}

(<any>lodash.memoize).Cache = Map;

if (Runtime.runtimeType === RuntimeType.browser) {
    let thisPackageMetadata = require("@ncorefx/core/package.json");

    Runtime.registerPackage(thisPackageMetadata["name"], thisPackageMetadata, [ { cultureName: "en-US", strings: require("@ncorefx/core/.resources/en-US/strings.json")} ]);
}

export * from "./Errors";
export * from "./System";
export * from "./Constructor";
export * from "./Context";
export * from "./CultureContext";
export * from "./CultureInfo";
export * from "./ILazy";
export * from "./ILazySync";
export * from "./ILocationPathProvider";
export * from "./Lazy";
export * from "./LazySync";
export * from "./MemoizeDecorator";
export * from "./ResourceManager";
export * from "./Runtime";
export * from "./RuntimeType";
