import "reflect-metadata";

import * as lodash from "lodash";
lodash.memoize.Cache = Map;

export * from "./CoreTypes";
export * from "./Lazy";
export * from "./ILazy";

export * from "./Decorators/index";
