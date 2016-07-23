import * as _ from "lodash";

const INSTANCE_PROPERTY_PREFIX: string = "core:memoized";

/**
 * Memoizes the decorated method or property by caching the result of the first invocation and then returning
 * it on all subsequent invocations.
 *
 * @param resolver An optional function that can be used to compute a hash from the supplied arguments as part
 * of the caching process.
 *
 * @returns A {MethodDecorator} that applies the memoization to the applied method or property.
 *
 * @remarks
 * Memoizing is useful for speeding up slow running computations, and the Memoize decorator can be applied
 * to both static and instance methods, and also to properties. The _resolver_ is ignored if the decorator
 * is being applied to a property because no arguments are provided to a property's accessor.
 */
export function memoize(resolver?: (...args: any[]) => any): MethodDecorator {
    return function (target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) {
        if (descriptor.value) return memoizeMethod(target, propertyKey, descriptor, resolver);

        if (descriptor.get) return memoizePropertyAccessor(descriptor, propertyKey);

        return descriptor;
    }
}

/**
 * Creates a function that wraps a supplied function with memoization semantics.
 *
 * @remarks
 * The returned function will create a non-enumerable property on the object that represents the memoized function.
 * This ensures that memoized functions are correctly applied across all instances of an object such that each
 * instance has its own version of the memoized function.
 */
function createMemoizingWrapper(func: (...args: any[]) => any, propertyKey: string, resolver?: (...args: any[]) => any): (...args: any[]) => any {
    return function (...args: any[]): any {
        if (!this) {
            return func.apply(this, args);
        }

        let wrapperFunc: Function = this[propertyKey];

        if (!wrapperFunc) {
            wrapperFunc = _.memoize(func, resolver);

            Object.defineProperty(this, propertyKey, {
                enumerable: false,
                value: wrapperFunc
            });
        }

        return wrapperFunc.apply(this, args);
    }
}

/**
 * Memoizes a method.
 */
function memoizeMethod(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>, resolver?: (...args: any[]) => any): TypedPropertyDescriptor<any> {
    descriptor.value = createMemoizingWrapper(descriptor.value, `${INSTANCE_PROPERTY_PREFIX}-${propertyKey}`, resolver);

    return descriptor;
}

/**
 * Memoizes a property.
 */
function memoizePropertyAccessor(descriptor: TypedPropertyDescriptor<any>, propertyKey: string | symbol): TypedPropertyDescriptor<any> {
    const instancePropertyKey = `${INSTANCE_PROPERTY_PREFIX}-${propertyKey}`;

    descriptor.get = createMemoizingWrapper(descriptor.get, instancePropertyKey);

    if (descriptor.set) {
        const originalSetter = descriptor.set;

        descriptor.set = function (...args: any[]): any {
            let wrapperFunc: _.MemoizedFunction = this[instancePropertyKey];

            (<any>wrapperFunc.cache).clear();

            return originalSetter.apply(this, args);
        };
    }

    return descriptor;
}
