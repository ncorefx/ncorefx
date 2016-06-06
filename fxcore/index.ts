declare function require(modulePath: string);

if (typeof(Zone) === "undefined") require("zone.js");

import "reflect-metadata";

import * as lodash from "lodash";
lodash.memoize.Cache = Map;

export * from "./CoreTypes";
export * from "./Lazy";
export * from "./ILazy";
export * from "./Tuple";
export * from "./Context";
export * from "./Runtime";
export * from "./RuntimeType";
export * from "./PackageInfo";
export * from "./CultureContext";
export * from "./CultureInfo";

export * from "./Resources/index";

export * from "./Decorators/index";

export * from "./Errors/index";
