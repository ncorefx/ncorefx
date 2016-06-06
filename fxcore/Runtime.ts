import {RuntimeType} from "./RuntimeType";

export class Runtime {
    /**
     * Retrieves the runtime type that the code is executing in.
     *
     * @returns A {RuntimeType} value.
     */
    public static getRuntimeType(): RuntimeType {
        return (process && global) ? RuntimeType.Node : RuntimeType.Browser;
    }

    /**
     * Returns true if the code is executing in a 'development' envionment.
     *
     * @returns *true* if the runtime is currently a 'development' runtime; otherwise *false*.
     */
    public static isDevelopmentRuntime(): boolean {
        let nodeEnv = process.env.NODE_ENV;

        if (!nodeEnv) return true;

        return nodeEnv !== "production";
    }
}
