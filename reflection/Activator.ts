import {reflect} from "@ncorefx/core";

import {TypeInfo} from "./TypeInfo";

export class Activator {
    public static createObject(targetType: TypeInfo, ...args: any[]): any {
        return reflect.construct(targetType.typeConstructor, args);
    }
}
