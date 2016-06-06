import {Runtime} from "../Runtime";
import {RuntimeType} from "../RuntimeType";

/**
 * Ensures that the decorated method is only called in the Node.js runtime, and delegates to a method suffixed
 * with '_Browser' when the runtime indicates a Browser.
 *
 * @returns A {MethodDecorator} that applies the runtime selection semantics.
 */
export function nodeGuard(): MethodDecorator {
    return function (target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) {
        let currentFunc: Function = descriptor.value;

        let guardFunc = function (...args: any[]): any {
            if (Runtime.getRuntimeType() === RuntimeType.Node) {
                return currentFunc.apply(this, args);
            }

            let browserPropertyKey = propertyKey.toString() + "_Browser";
            let browserFunc = this[browserPropertyKey];

            if (!browserFunc) return undefined;

            return browserFunc.apply(this, args);
        };

        descriptor.value = guardFunc;
    }
}
