import {Tuple, InvalidOperationError, memoize, PackageInfo, Runtime} from "@ncorefx/fxcore";

import {fsAsync} from "@ncorefx/core";

import * as express from "express";
import * as React from "react";
import {renderToString} from "react-dom/server";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";
import * as SystemJSBuilder from "systemjs-builder";
import * as babel from "babel-core";

import {RouteActionResult} from "./RouteActionResult";

import {HttpContext} from "../HttpContext";

class SpaPageScriptSet {
    constructor(public debugScripts, public es6Scripts: string[], public es5Scripts: string[]) {
    }
}

class SpaPageHostProps {
    constructor(public scriptPaths: string[]) {
    }
}

class SpaPageHost extends React.Component<SpaPageHostProps, {}> {
    public render(): JSX.Element {
        return (
            <html>
                <head>
                    <script src="./node_modules/systemjs/dist/system.js"></script>
                </head>

                <body>
                    <div id="app"></div>
                    { this.props.scriptPaths.map((scriptPath, idx) => <script key={idx} src={scriptPath}></script>) }
                </body>
            </html>
        );
    }
}

/**
 * Represents a HTML content type that is the result of rendering a React based Single Page
 * Application (SPA).
 */
export class ReactSpaApplicationRouteActionResult extends RouteActionResult {
    private _spaPackagePath: string;
    private _absoluteSpaPackagePath: string;
    private _packageStack: Tuple<string, Object>[];

    /**
     * Initializes a new {ReactSpaApplicationRouteActionResult} object for the given path.
     *
     * @param spaApplicationPath The path to the Single Page Application.
     */
    constructor(spaApplicationPath: string) {
        super();

        this._spaPackagePath = spaApplicationPath;

        try {
            this._absoluteSpaPackagePath = require.resolve(path.join(spaApplicationPath, "package.json"));
        }
        catch (error) {
            throw new InvalidOperationError(`Path '${spaApplicationPath}' did not resolve to a package.`);
        }
    }

    /**
     * Writes the Single Page Application (SPA) to the ExpressJS response.
     *
     * @param response The {express.Response} to write the data to.
     */
    protected async onWriteResult(response: express.Response): Promise<void> {
        let spaPackage = require(this._absoluteSpaPackagePath);

        this._packageStack = [Tuple.create(this._absoluteSpaPackagePath, spaPackage)];

        try {
            let scriptSet = await this.generateSystemJSScripts(spaPackage.name);

            response.type("text/html");

            let selectedScriptSet = this.isES2015Browser() && Runtime.isDevelopmentRuntime()
                ? scriptSet.debugScripts
                : this.isES2015Browser()
                    ? scriptSet.es6Scripts
                    : scriptSet.es5Scripts;

            response.send(renderToString(<SpaPageHost scriptPaths={selectedScriptSet} />));
        }
        catch (error) {
            console.log(error);
        }
    }

    @memoize()
    private async generateSystemJSScripts(appName: string): Promise<SpaPageScriptSet> {
        let rootPath = PackageInfo.getEntryPackage().location;

        let cachePath = path.join(rootPath, "./.spacache");

        if (!(await fsAsync.exists(cachePath))) {
            await fsAsync.mkdir(cachePath);
        }

        let systemJSConfig = {
            baseURL: "./node_modules",
            defaultExtention: "js",
            packages: await this.buildSystemJsPackages()
        };

        let appCachePath = path.join(cachePath, appName);

        if (!(await fsAsync.exists(appCachePath))) {
            await fsAsync.mkdir(appCachePath);
        }

        let appConfigScriptPath = path.join(appCachePath, "config.js");
        let appScriptPath = path.join(appCachePath, `${appName}.js`);

        await fsAsync.writeFile(appConfigScriptPath, `System.config(${JSON.stringify(systemJSConfig, null, 2)});`);
        await fsAsync.writeFile(appScriptPath, `System.import("${appName}");`);

        let debugScripts = [
            this.makePackageRelativePath(rootPath, appConfigScriptPath),
            this.makePackageRelativePath(rootPath, appScriptPath)
        ];

        let appScriptES6BundlePath = path.join(appCachePath, `${appName}-bundle-es6.js`);

        let builder = new SystemJSBuilder(systemJSConfig.baseURL, systemJSConfig);

        await builder.buildStatic(appName, appScriptES6BundlePath, { runtime: false });

        let es6Scripts = [this.makePackageRelativePath(rootPath, appScriptES6BundlePath)];

        let appScriptES5BundlePath = path.join(appCachePath, `${appName}-bundle-es5.js`);

        builder = new SystemJSBuilder(systemJSConfig.baseURL, systemJSConfig);

        await builder.buildStatic(appName,
            appScriptES5BundlePath,
            {
                runtime: true,
                fetch: (load, fetch) => {
                    return babel.transformFileSync(load.name.substring(os.platform() === "win32" ? 8 : 7), { presets: ["es2015"], compact: false }).code;
                }
            });

        let es5Scripts = [
            this.makePackageRelativePath(rootPath, path.join(path.parse(require.resolve("babel-polyfill")).dir, "../dist/polyfill.min.js")),
            this.makePackageRelativePath(rootPath, appScriptES5BundlePath)
        ];

        return new SpaPageScriptSet(debugScripts, es6Scripts, es5Scripts);
    }

    private async buildSystemJsPackages(moduleFormat: string = "cjs"): Promise<Object> {
        let systemJSPackages = {};

        systemJSPackages["react"] = { "main": "./dist/react-with-addons.min.js", "format": "cjs" };
        systemJSPackages["react-dom"] = { "main": "./dist/react-dom.min.js", "format": "cjs" };

        while (true) {
            let currentPackage = this._packageStack.pop();

            if (!currentPackage) break;

            let currentPackagePath = path.parse(currentPackage.item1).dir;
            let currentPackageData = currentPackage.item2;

            if (currentPackageData["name"] === "systemjs"
                || currentPackageData["name"] === "react"
                || currentPackageData["name"] === "react-dom"
                || currentPackageData["name"] === "babel-polyfill") continue;

            systemJSPackages[currentPackageData["name"]] = {
                "main": currentPackageData["main"] || "./index.js",
                "format": moduleFormat
            };

            if (!currentPackageData["dependencies"]) continue;

            systemJSPackages[currentPackageData["name"]]["map"] = await this.buildSystemJsPackageDependencies(currentPackagePath, currentPackage);
        }

        return systemJSPackages;
    }

    private async buildSystemJsPackageDependencies(rootPackagePath: string, currentPackage: Tuple<string, Object>): Promise<Object> {
        let dependencies = {};

        let currentPackagePath = path.parse(currentPackage.item1).dir;
        let currentPackageData = currentPackage.item2;

        for (let dependency in currentPackageData["dependencies"]) {
            let dependencyPackagePath = path.join(currentPackagePath, "node_modules", dependency, "package.json");

            if (!fs.existsSync(dependencyPackagePath)) {
                try {
                    let absoluteDependencyPath = require.resolve(path.join(dependency, "package.json"));

                    this._packageStack.push(Tuple.create(absoluteDependencyPath, require(absoluteDependencyPath)));
                }
                catch (error) {
                    throw new InvalidOperationError(`Could not resolve '${dependency}' to a package.`);
                }

                continue;
            }

            let dependencyPath = path.join(currentPackagePath, "node_modules", dependency);
            let dependencyPackage = require(dependencyPackagePath);

            dependencies[dependency] = this.makePackageRelativePath(rootPackagePath, path.join(dependencyPath, dependencyPackage["main"] || "./index.js"));

            if (dependency === "@ncorefx/fxcore") {
                dependencies["crypto"] = (dependencies["@ncorefx/fxcore"] as string).replace("/index.js", "/NullModule.js");
                dependencies["fs"] = (dependencies["@ncorefx/fxcore"] as string).replace("/index.js", "/NullModule.js");
                dependencies["path"] = (dependencies["@ncorefx/fxcore"] as string).replace("/index.js", "/NullModule.js");
            }
            else if (dependency === "zone.js") {
                // Make sure we bundle the non-Node.js version of zone.js
                dependencies["zone.js"] = this.makePackageRelativePath(rootPackagePath, path.join(dependencyPath, "./dist/zone.min.js"));
            }

            dependencies = Object.assign(dependencies, await this.buildSystemJsPackageDependencies(rootPackagePath, Tuple.create(dependencyPackagePath, dependencyPackage)));
        }

        return dependencies;
    }

    private makePackageRelativePath(packagePath: string, pathToMake: string): string {
        return `./${pathToMake.substr(packagePath.length + 1).replace(/\\/g, "/")}`;
    }

    /**
     * Detects if the browser is Chrome 50+ by inspecting the User-Agent header.
     *
     * @returns *true* if the User-Agent header indicates a compatible version of Chrome that supports ES6 features;
     * otherwise *false*.
     */
    private isES2015Browser(): boolean {
        let matches = /Chrome\/(\d*)/.exec(HttpContext.current.request.get("User-Agent"));

        if (!matches) return false;

        return parseInt(matches[1]) >= 50;
    }
}
