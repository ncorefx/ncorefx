import * as _ from "lodash";

import {Constructor} from "./CoreTypes";
import {ZoneContext} from "./ZoneContext";

/**
 * A utility class for defining excution contexts that persist across asynchronous functions.
 *
 * @remarks
 * The [Context] class provides a [[Context.using]] and a [[Context.getContextObject]] function
 * that together provide a means of implementing continuation local storage for all asynchronous functions that
 * are to be executed within an established execution context.
 */
export class Context {
    private static DEFAULT_ZONE_NAME: string = undefined;
    private static ZONESPEC_PROPERTY_SLOTNAME: string = "ncorefx:zone-context";

    /**
     * Establishes a new execution context.
     *
     * @param contextObjects The context objects that should be associated with this execution context.
     * @param action An action that represents the root of the executing context.
     * @param name An optional name for the execution context.
     *
     * @example
     * ~~~
     * Context.using([new DatabaseTransactionContext()], () =>
     * {
     *    // DatabaseTransactionContext is now available for any asynchronous function by calling
     *    // Context.getContextObject(DatabaseTransactionContext)
     * });
     * ~~~
     */
    public static using(contextObjects: Object[], action: () => void, name?: string): void {
        let zoneCtx = new ZoneContext();

        for (let contextObject of contextObjects) {
            zoneCtx.set((<any>contextObject).constructor, contextObject);
        }

        let newZoneSpec: ZoneSpec =
            {
                name: name || Context.DEFAULT_ZONE_NAME,
                properties: {}
            };

        newZoneSpec.properties[Context.ZONESPEC_PROPERTY_SLOTNAME] = zoneCtx;
        newZoneSpec.onScheduleTask = Context.onScheduleTask;
        newZoneSpec.onInvokeTask = Context.onInvokeTask;
        newZoneSpec.onInvoke = Context.onInvoke;

        Zone.current.fork(newZoneSpec).run(action);
    }

    /**
     * Retrieves a context object from the current execution context.
     *
     * @param type The type of context object that should be retrieved.
     *
     * @returns The context object of the given type or `undefined` if the type of context object
     * couldn't be found.
     *
     * @example
     * ~~~
     * Context.using([new DatabaseTransactionContext()], () =>
     * {
     *    setImmediate(() =>
     *    {
     *       let dbContext = Context.getContextObject(DatabaseTransactionContext);
     *
     *       dbContext.commit();
     *    });
     * });
     * ~~~
     */
    public static getContextObject<T>(type: Constructor<T>): T {
        let contextObject: Object = undefined;
        let currentZone: Zone = Zone.current;

        while (currentZone) {
            let currentZoneContext: ZoneContext = <ZoneContext>currentZone.get(Context.ZONESPEC_PROPERTY_SLOTNAME);

            // It's plausible that the zone doesn't have the 'contextObjects' property we're looking for because the Zone
            // API is global and the calling code may have introduced its own zones. If this is the case then just move on
            if (currentZoneContext) {
                contextObject = currentZoneContext.get(type);

                if (contextObject) break;
            }

            currentZone = currentZone.parent;
        }

        return <T>contextObject;
    }

    /**
     * Invoked when an action representing a context scope block is required to execute.
     *
     * @param parentZoneDelegate
     * @param currentZone
     * @param targetZone
     * @param delegate
     * @param applyThis
     * @param applyArgs
     * @param source
     *
     * @returns The value returned from the executed action.
     *
     * @remarks
     * This function wraps the invocation of the context scope block action with calls to `addRef()` and
     * `release()` in order that the reference counts for the appropriate context objects are maintained
     * during the invocation. This ensures that if no asynchronous functions are scheduled during the
     * execution of the action then the context objects are still correctly disposed of when the context
     * scope block is exited.
     */
    private static onInvoke(parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, delegate: Function, applyThis: any, applyArgs: any[], source: string): any {
        let targetZoneContext = <ZoneContext>currentZone.get(Context.ZONESPEC_PROPERTY_SLOTNAME);

        try {
            targetZoneContext.addRef();

            return delegate.apply(applyThis, applyArgs);
        }
        finally {
            targetZoneContext.release();
        }
    }

    /**
     * Invoked when an asynchronous function is being scheduled.
     *
     * @param parentZoneDelegate
     * @param currentZone
     * @param targetZone
     * @param task
     *
     * @returns The supplied _task_.
     *
     * @remarks
     * When an asynchronous function is being scheduled, its execution will potentially take place after the current
     * context scope block has exited. As such, when the asynchronous function is being scheduled the reference count for
     * the current context objects must be incremented so that they are not disposed of until the asynchronous function
     * has also exited.
     */
    private static onScheduleTask(parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, task: Task): Task {
        (<ZoneContext>currentZone.get(Context.ZONESPEC_PROPERTY_SLOTNAME)).addRef();

        return parentZoneDelegate.scheduleTask(targetZone, task);
    }

    /**
     * Invoked when an asynchronous function is being executed.
     *
     * @param parentZoneDelegate
     * @param currentZone
     * @param targetZone
     * @param task
     * @param applyThis
     * @param applyArgs
     *
     * @returns The value returned from the asynchronous function.
     *
     * @remarks
     * When an asynchronous function has exited the reference count for the current context objects must be decremented. When
     * the reference count reaches zero it indicates that all asynchronous functions that were scheduled within the containing
     * context scope block have now exited, and that the current context objects can be disposed of.
     */
    private static onInvokeTask(parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, task: Task, applyThis: any, applyArgs: any): any {
        try {
            return parentZoneDelegate.invokeTask(targetZone, task, applyThis, applyArgs);
        }
        finally {
            (<ZoneContext>currentZone.get(Context.ZONESPEC_PROPERTY_SLOTNAME)).release();
        }
    }
}
