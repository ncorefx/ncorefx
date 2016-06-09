import * as express from "express";

import {
    Constructor,
    ConstructorGuard,
    memoize,
    Context,
    CultureContext,
    CultureInfo
} from "@ncorefx/fxcore";

import {
    IExportProvider,
    ILazyExport,
    ImportTarget,
    ExportProviderFunc
} from "@ncorefx/fxcomposition";

import {RouteActionResult} from "./RouteActionResults/RouteActionResult";

import {IRouterOptions} from "./IRouterOptions";
import {HttpVerbs} from "./HttpVerbs";
import {RouteHandler} from "./RouteHandler";
import {RouteAction, RouteActionFunc} from "./RouteAction";
import {HttpContext} from "./HttpContext";

/**
 * Creates an ExpressJS Router that is configured with the routes composed from the {RouteHandler}
 * objects found in a given export provider.
 */
export class ComposedRouter {
    /**
     * Initializes a new {ComposedRouter} object with a given export provider.
     *
     * @param exportProvider The {IExportProvider} implementation that will be queried for the
     * {RouteHandler} implementations.
     * @param routerOptions The options that will be provided to ExpressJS when the router is created.
     */
    constructor(private exportProvider: IExportProvider, private routerOptions?: IRouterOptions) {
    }

    /**
     * Gets the ExpressJS Router that can be used with ExpressJS.
     *
     * @returns A {express.Router}.
     */
    @memoize()
    public async getRouter(): Promise<express.Router> {
        let router = express.Router(this.routerOptions);

        for (let exportedRouteHandler of await this.exportProvider.getExports(RouteHandler)) {
            let routeActions = <Set<RouteAction>>Reflect.getOwnMetadata("ncorefx:web:route-actions", exportedRouteHandler.metadata.target);

            if (!routeActions) continue;

            for (let routeAction of routeActions) {
                let routeMatcherFunc: express.IRouterMatcher<any>;

                switch (routeAction.httpVerb) {
                    case HttpVerbs.Get:
                        router.get(routeAction.path, this.createRouteActionHandler(exportedRouteHandler.metadata.target, routeAction.routeActionFunc));
                        break;

                    case HttpVerbs.Post:
                        router.post(routeAction.path, this.createRouteActionHandler(exportedRouteHandler.metadata.target, routeAction.routeActionFunc));
                        break;

                    case HttpVerbs.Put:
                        router.put(routeAction.path, this.createRouteActionHandler(exportedRouteHandler.metadata.target, routeAction.routeActionFunc));
                        break;

                    case HttpVerbs.Delete:
                        router.delete(routeAction.path, this.createRouteActionHandler(exportedRouteHandler.metadata.target, routeAction.routeActionFunc));
                        break;

                    case HttpVerbs.Patch:
                        router.patch(routeAction.path, this.createRouteActionHandler(exportedRouteHandler.metadata.target, routeAction.routeActionFunc));
                        break;

                    case HttpVerbs.Options:
                        router.options(routeAction.path, this.createRouteActionHandler(exportedRouteHandler.metadata.target, routeAction.routeActionFunc));
                        break;

                    case HttpVerbs.Head:
                        router.head(routeAction.path, this.createRouteActionHandler(exportedRouteHandler.metadata.target, routeAction.routeActionFunc));
                        break;
                }
            }
        }

        return router;
    }

    /**
     * Creates an ExpressJS request handler for a given route action.
     *
     * @param target The {RouteHandler}.
     * @param func The {RouteActionFunc} that is to be invoked for this request handler.
     *
     * @returns A {express.RequestHandler} that will delegate to _func_.
     */
    private createRouteActionHandler(target: Constructor<RouteHandler>, func: RouteActionFunc): express.RequestHandler {
        return async (request: express.Request, response: express.Response, next: express.NextFunction) => {
            let contextObjects: any[] = [];
            let langMatches = /([a-z]{2}\-[A-z]{2})/.exec(request.header("Accept-Language"));

            contextObjects.push(new CultureContext(langMatches ? langMatches[1] : CultureInfo.getSystemCulture().name));
            contextObjects.push(new HttpContext(request));

            Context.using(contextObjects, async () => {
                try {
                    let targetRouteHandler = await this.exportProvider.getExportedValue(target);

                    let routeHandlerResult = func.apply(targetRouteHandler, await this.getRouteHandlerArguments(target, func, request));

                    let routeActionResult: RouteActionResult = (routeHandlerResult instanceof Promise)
                        ? await <Promise<RouteActionResult>>routeHandlerResult
                        : routeHandlerResult;

                    await routeActionResult.writeResult(response);

                    return next();
                }
                catch (error) {
                    return next(error);
                }
            });
        };
    }

    /**
     * Matches any route parameters to the route arguments for a given route action.
     *
     * @param target The {RouteHandler}.
     * @param func The {RouteActionFunc} that is to be invoked for this request handler.
     * @param request The {express.Request} from which route parameters can be queried.
     *
     * @returns An array of values that be bound to the route action specified by _func_.
     */
    private async getRouteHandlerArguments(target: Constructor<RouteHandler>, func: RouteActionFunc, request: express.Request): Promise<any[]> {
        if (func.length === 0) return [];

        let argNames = ComposedRouter.getFuncArgNames(func);
        let designTypes = Reflect.getOwnMetadata("design:paramtypes", target.prototype, func.name) || [];
        let importTargets = <ImportTarget[]>Reflect.getMetadata("ncorefx:composition:import-targets", target.prototype, func.name) || [];

        let funcArgs: any[] = [];

        for(let funcArgIdx = 0; funcArgIdx < argNames.length; funcArgIdx++) {
            let funcArgImportTarget: ImportTarget = importTargets[funcArgIdx] || designTypes[funcArgIdx];
            let funcArg: any = undefined;

            let requestFuncArg: string  = request.params[argNames[funcArgIdx]];

            if (requestFuncArg) {
                if (funcArgImportTarget === Number) {
                    funcArg = requestFuncArg.indexOf(".") >= 0 ? parseFloat(requestFuncArg) : parseInt(requestFuncArg);
                }
                else if (funcArgImportTarget === Date) {
                    funcArg = new Date(requestFuncArg);
                }
                else if (funcArgImportTarget === Boolean) {
                    funcArg = funcArg; // TODO
                }
                else if (funcArgImportTarget === String) {
                    funcArg = requestFuncArg;
                }
                else {
                    // This import target needs to be a ParameterProvider
                    funcArg = await this.getExportForImportTarget(funcArgImportTarget);
                }
            }
            else {
                funcArg = await this.getExportForImportTarget(funcArgImportTarget);
            }

            funcArgs.push(funcArg);
        }

        return funcArgs;
    }

    /**
     * Gets an export for a given import target.
     *
     * @param importTarget The {ImportTarget}.
     *
     * @returns The export that was satisfied by _importTarget_.
     */
    private getExportForImportTarget(importTarget: ImportTarget): Promise<any> {
        if (ConstructorGuard.isConstructor(importTarget)) {
            return this.exportProvider.getExportedValue(importTarget);
        }
        else {
            return (<ExportProviderFunc>importTarget)(this.exportProvider);
        }
    }

    /**
     * Retrieves the argument names for a given route action.
     *
     * @param func The {RouteActionFunc}.
     *
     * @returns An array of string representing the arguments of _func_.
     */
    @memoize()
    private static getFuncArgNames(func: RouteActionFunc): string[] {
		let args: string[] = [];

        let sourceArgs = func.toString().match(/^(function)?.*?\(([^)]*)\)/)[2];

        if (!sourceArgs) return args;

		for (let sourceArg of sourceArgs.split(",")) {
			sourceArg = sourceArg.replace(/\/\*.*\*\//, '').trim();

			if (sourceArg) args.push(sourceArg);
		}

		return args;
    }
}
