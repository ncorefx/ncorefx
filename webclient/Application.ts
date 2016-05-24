import {Constructor} from "@ncorefx/fxcore";

import {ReactElement} from "react";
import * as ReactDOM from "react-dom";

declare function require(modulePath: string);

/**
 * A base class for bootstrapping a Single Page Application (SPA) based on ReactJS.
 *
 * @typeparam TState The type of state that the application will execute for.
 */
export abstract class Application<TState> {
    /**
     * Called by the framework when the application has loaded and requires initialization.
     *
     * @returns A promise that yields the application state object.
     *
     * @remarks
     * Derived classes can override this method to provide custom initialization before the application
     * is rendered on screen.
     */
    public async onInitialize(): Promise<TState> {
        return undefined;
    }

    /**
     * Called by the framework to retrieve the root React element for the application.
     *
     * @param state The state object that should during the initialization of the root React element.
     *
     * @remarks
     * Derived class must override this method to return the root component that will be
     * rendered on screen.
     */
    public abstract onGetRootComponent(state: TState): ReactElement<any>;

    /**
     * Bootstraps a specified Single Page Application (SPA).
     *
     * @param applicationType The type of Application that should be used to start the application.
     */
    public static async bootstrap(applicationType: Constructor<any>): Promise<void> {
        let divElement = document.getElementById("app") || document.getElementsByTagName("div").item(0);

        let application: Application<any> = new applicationType();

        let applicationState = await application.onInitialize();

        ReactDOM.render(await application.onGetRootComponent(applicationState), divElement);
    }
}
