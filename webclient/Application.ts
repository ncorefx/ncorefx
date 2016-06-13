import {Constructor, Context, CultureContext, PackageInfo, CultureInfo} from "@ncorefx/fxcore";
import {HttpClient} from "@ncorefx/fxhttp";

import {ReactElement} from "react";
import * as ReactDOM from "react-dom";

/**
 * A base class for bootstrapping a Single Page Application (SPA) based on ReactJS.
 *
 * @typeparam TState The type of state that the application will execute for.
 */
export abstract class Application<TState> {
    /**
     * Starts the application.
     */
    public async start(): Promise<void> {
        let currentCultureName = CultureInfo.getSystemCulture().name;

        await Application.loadResources(currentCultureName);

        Context.using([new CultureContext(currentCultureName)], async () => {
            let divElement = document.getElementById("app") || document.getElementsByTagName("div").item(0);

            let applicationState = await this.onInitialize();

            ReactDOM.render(await this.onGetRootComponent(applicationState), divElement);
        });
    }

    /**
     * Changes the current culture of the application.
     */
    public static async setCurrentCulture(cultureName: string): Promise<void> {
        await this.loadResources(cultureName);

        let cultureCtx = CultureContext.current;

        if (cultureCtx) {
            cultureCtx.name = cultureName;
        }
    }

    /**
     * Called by the framework when the application has loaded and requires initialization.
     *
     * @returns A promise that yields the application state object.
     *
     * @remarks
     * Derived classes can override this method to provide custom initialization before the application
     * is rendered on screen.
     */
    protected async onInitialize(): Promise<TState> {
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
    protected abstract onGetRootComponent(state: TState): ReactElement<any>;

    /**
     * Loads resource data from the server based on a given culture name.
     *
     * @param cultureName The name of the culture that should be loaded.
     *
     * @remarks
     * A HTTP request will be made to the server using a URI built from the location of the entry
     * {PackageInfo} and the culture name given.
     */
     private static async loadResources(cultureName: string): Promise<void> {
         let resourceSet = <Map<string, Map<string, any>>>Reflect.getMetadata("ncorefx:resources:strings", window);

         if (!resourceSet) resourceSet = new Map<string, Map<string, any>>();

         if (resourceSet.get(cultureName)) return;

         let httpClient = new HttpClient();
         let packages = <Map<string, any>>Reflect.getMetadata("ncorefx:packages:packages", window);

         if (packages) {
             let packageSet = new Map<string, any>();

             for (let keyValuePair of packages) {
                 let responseMessage = await httpClient.get(`node_modules/${new PackageInfo(keyValuePair[1].location).location}/.resources/${cultureName}/strings.json`);

                 if (responseMessage.isSuccessful()) {
                    packageSet.set(keyValuePair[0], JSON.parse(responseMessage.body));
                 }
             }

             resourceSet.set(cultureName, packageSet);
         }

         Reflect.defineMetadata("ncorefx:resources:strings", resourceSet, window);
    }
}
