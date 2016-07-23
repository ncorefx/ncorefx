import {RuntimeType} from "./RuntimeType";
import {reflect, packageSys, ResourceStrings} from "./System";

/**
 * Describes and provides utilities that affect the current runtime.
 */
export class Runtime {
    /**
     * Retrieves the runtime type that the code is executing in.
     *
     * @returns A {RuntimeType} value.
     */
    public static get runtimeType(): RuntimeType {
        if (typeof window !== "undefined") {
            return <any>global !== <any>window ? RuntimeType.node : RuntimeType.browser;
        }

        return RuntimeType.node;
    }

    /**
     * Returns true if the code is executing in a 'development' envionment.
     *
     * @returns *true* if the runtime is currently a 'development' runtime; otherwise *false*.
     */
    public static get isDevelopmentRuntime(): boolean {
        let nodeEnv = process.env.NODE_ENV;

        return nodeEnv ? nodeEnv !== "production" : true;
    }

    /**
     * Registers a package with the current runtime.
     * 
     * @param packageName The name of the package.
     * @param packageMetadata The contents of the 'package.json'.
     * @param resources An array of resource definitions that contain a mapping from a culture name
     * to an object containing the resources for that culture, or a relative path to where the resources
     * can be obtained.
     * 
     * @remarks
     * For applications that are based on a 'browser' runtime (i.e., Web or React Native), the dependencies of that
     * application should be registered with the runtime in order for package based reflection to work consistently.
     * This is required because all the packages that make up the running application will likely be bundled into a
     * single .js file for deployment and normal package traversal will be impossible.
     * 
     * The @corefx packages automatically register themselves when running in a 'browser' runtime.
     */
    public static registerPackage(packageName: string, packageMetadata: Object, resources?: ResourceStrings[]): void {
        if (Runtime.runtimeType !== RuntimeType.browser) return;

        packageSys.register(packageName, packageMetadata, resources);
    }
}
