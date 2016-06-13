import {
    PackageInfo,
    InvalidOperationError,
    Runtime
} from "@ncorefx/fxcore";

import {fsAsync} from "@ncorefx/core";

import * as path from "path";
import * as fs from "fs";
import * as SystemJSBuilder from "systemjs-builder";
import * as os from "os";
import * as babel from "babel-core";

import {HttpContext} from "../HttpContext";

import {SinglePageApplicationBundle} from "./SinglePageApplicationBundle";

/**
 * Bundles a React based Single Page Application (SPA).
 */
export class SinglePageApplicationBundleBuilder {
    private _spaPackageInfo: PackageInfo;
    private _packageInfoStack: PackageInfo[];
    private _dependentPackages: Map<string, PackageInfo>;

    /**
     * Initializes a new {SinglePageApplicationBundleBuilder} object.
     *
     * @param spaPackageInfo The {PackageInfo} that contains the Single Page Application (SPA).
     */
    constructor(spaPackageInfo: PackageInfo) {
        this._spaPackageInfo = spaPackageInfo;
    }

    /**
     * Bundles the Single Page Application (SPA) ready for rendering in a Browser runtime.
     *
     * @returns A promise that yields a {SinglePageApplicationBundle} object that contains the script paths
     * that should be used when rendering the Single Page Application (SPA).
     */
    public async bundle(): Promise<SinglePageApplicationBundle> {
        let rootPath = PackageInfo.getEntryPackage().location;
        let bootstrapPackageName = `${this._spaPackageInfo.name}-bootstrap`;
        let bootstrapPackagePath = path.join(rootPath, "node_modules", bootstrapPackageName);
        let bootstrapPackageInfo: PackageInfo;

        if (fs.existsSync(bootstrapPackagePath)) {
            bootstrapPackageInfo = new PackageInfo(path.join(bootstrapPackagePath, "package.json"));

            if (bootstrapPackageInfo.version !== this._spaPackageInfo.version) {
                // The version of the SPA is different to the bootstrap - delete and rebuild it
                fs.rmdirSync(bootstrapPackageInfo.location);

                bootstrapPackageInfo = await this.buildBootstrapPackage(rootPath, bootstrapPackageName, bootstrapPackagePath);
            }
        }
        else {
            bootstrapPackageInfo = await this.buildBootstrapPackage(rootPath, bootstrapPackageName, bootstrapPackagePath);
        }

        let scriptSet = await this.generateSystemJSScripts(bootstrapPackageInfo);

        let isES2015CompatibleBrowser = this.isBrowserES2015Compatible();

        return new SinglePageApplicationBundle([SinglePageApplicationBundleBuilder.makePath(rootPath, require.resolve("systemjs").replace("index.js", "dist/system.js"))],
            isES2015CompatibleBrowser && Runtime.isDevelopmentRuntime()
                ? scriptSet.debugScripts
                : isES2015CompatibleBrowser
                    ? scriptSet.es2015Scripts
                    : scriptSet.es5Scripts);
    }

    /**
     * Builds the bootstrap package for the SPA application.
     *
     * @returns A promise that yields a {PackageInfo} for the bootstrap package.
     */
    private async buildBootstrapPackage(rootPath: string, bootstrapPackageName: string,  bootstrapPackagePath: string): Promise<PackageInfo> {
        this._packageInfoStack = [this._spaPackageInfo];

        let systemJSConfig = {
            baseURL: "./node_modules",
            defaultExtention: "js",
            meta: {
                "*.json": { loader: "json" }
            },
            map: {
                "json": SinglePageApplicationBundleBuilder.makePath(rootPath, require.resolve("systemjs-plugin-json"))
            },
            packages: await this.buildSystemJSPackages()
        };

        let packageSetJSRequireCode: string = "";
        let packageSetJSMapCode: string = `packageSet.set("${this._spaPackageInfo.name}", {location: "${this._spaPackageInfo.name}/package.json", packageData: entryPackageData});${os.EOL}`;

        let dependentPackageIdx = 0;
        for (let dependentPackage of this._dependentPackages) {
            let dependentPackageLocation = `${SinglePageApplicationBundleBuilder.makePath(path.join(rootPath, "node_modules"), dependentPackage[1].location, false)}/package.json`;

            packageSetJSRequireCode += `const p${dependentPackageIdx} = require("${dependentPackageLocation}");${os.EOL}`;
            packageSetJSMapCode += `packageSet.set("${dependentPackage[0]}", {location: "${dependentPackageLocation}", packageData: p${dependentPackageIdx}});${os.EOL}`;

            dependentPackageIdx++;
        }

        let bootstrapJSCode = `"use strict";

/**
 * Bootstraps the '${this._spaPackageInfo.name}' Single Page Application.
 */

window.process = {env: {NODE_ENV: "${Runtime.isDevelopmentRuntime() ? "development" : "production"}"}};

const applicationModule = require("${this._spaPackageInfo.name}");

let entryPackageData = require("${this._spaPackageInfo.name}/package.json");
Reflect.defineMetadata("ncorefx:packages:entry-package", {location: "${this._spaPackageInfo.name}/package.json", packageData: entryPackageData}, window);

let packageSet = new Map();

${packageSetJSRequireCode}
${packageSetJSMapCode}
Reflect.defineMetadata("ncorefx:packages:packages", packageSet, window);

// Look for the first exported class from the Application module
function isClass(c) {
    return c.prototype && c.prototype.constructor;
}

let Application = applicationModule;

if (!isClass(Application)) {
    for (let c in applicationModule) {
        Application = applicationModule[c];

        if (isClass(Application)) break;
    }
}

// Create and start the application
new Application().start();
`;

        let bootstrapPackageJson = `{
    "name": "${bootstrapPackageName}",
    "description": "Bootstrapper for '${this._spaPackageInfo.name}'",
    "version": "${this._spaPackageInfo.version}",
    "main": "./index.js",
    "peerDependencies": {
        "${this._spaPackageInfo.name}": "${this._spaPackageInfo.version}"
    }
}`;

        fs.mkdirSync(bootstrapPackagePath);

        let bootstrapJSCodePath = path.join(bootstrapPackagePath, "index.js");
        let bootstrapPackageJsonPath = path.join(bootstrapPackagePath, "package.json");

        await fsAsync.writeFile(bootstrapJSCodePath, bootstrapJSCode);
        await fsAsync.writeFile(bootstrapPackageJsonPath, bootstrapPackageJson);

        return new PackageInfo(bootstrapPackageJsonPath);
    }

    /**
     * Generates the complete set of scripts that will be needed by the SystemJS runtime.
     *
     * @param bootstrapPackageInfo The {PackageInfo} that represents the bootstrap package for the SPA
     * application being requested.
     *
     * @returns A promise that yields a {ScriptSet} defining the sets of scripts that support debug, ES2015
     * and ES5.
     */
    private async generateSystemJSScripts(bootstrapPackageInfo: PackageInfo): Promise<ScriptSet> {
        this._packageInfoStack = [bootstrapPackageInfo, this._spaPackageInfo];

        let rootPath = PackageInfo.getEntryPackage().location;

        let scriptSet = new ScriptSet();

        let appConfigScriptPath = path.join(bootstrapPackageInfo.location, "config.js");
        let appScriptPath = path.join(bootstrapPackageInfo.location, "run.js");
        let es2015ScriptPath =  path.join(bootstrapPackageInfo.location, "es2015-bundle.js");
        let es5ScriptPath =  path.join(bootstrapPackageInfo.location, "es5-bundle.js");

        let systemJSConfig = {
            baseURL: "./node_modules",
            defaultExtention: "js",
            meta: {
                "*.json": { loader: "json" }
            },
            map: {
                "json": SinglePageApplicationBundleBuilder.makePath(rootPath, require.resolve("systemjs-plugin-json"))
            },
            packages: await this.buildSystemJSPackages()
        };

        await fsAsync.writeFile(appConfigScriptPath, `System.config(${JSON.stringify(systemJSConfig, null, 2)});`);

        if (!fs.existsSync(appScriptPath)) {
            await fsAsync.writeFile(appScriptPath, `System.import("${bootstrapPackageInfo.name}");`);
        }

        scriptSet.debugScripts = [
            SinglePageApplicationBundleBuilder.makePath(rootPath, appConfigScriptPath),
            SinglePageApplicationBundleBuilder.makePath(rootPath, appScriptPath)
        ];

        if (!fs.existsSync(es2015ScriptPath)) {
            let es2015Builder = new SystemJSBuilder(systemJSConfig.baseURL, systemJSConfig);

            await es2015Builder.buildStatic(bootstrapPackageInfo.name, es2015ScriptPath,
                {
                    runtime: true,
                    minify: !Runtime.isDevelopmentRuntime(),
                    fetch: (load, fetch) => {
                        if (!(load.name as string).endsWith(".js")) return fetch(load);

                        let code = fs.readFileSync(load.name.substring(os.platform() === "win32" ? 8 : 7)).toString();

                        return code.replace(/\/\/#\ssourceMappingURL=.*/g, os.EOL);
                    }
                });
        }

        scriptSet.es2015Scripts = [SinglePageApplicationBundleBuilder.makePath(rootPath, es2015ScriptPath)];

        if (!fs.existsSync(es5ScriptPath) && !Runtime.isDevelopmentRuntime()) {
            let es5Builder = new SystemJSBuilder(systemJSConfig.baseURL, systemJSConfig);

            await es5Builder.buildStatic(bootstrapPackageInfo.name, es5ScriptPath,
                {
                    runtime: true,
                    minify: !Runtime.isDevelopmentRuntime(),
                    fetch: (load, fetch) => {
                        if (!(load.name as string).endsWith(".js")) return fetch(load);

                        let code = babel.transformFileSync(load.name.substring(os.platform() === "win32" ? 8 : 7), { presets: ["es2015"], compact: false }).code;

                        return code.replace(/\/\/#\ssourceMappingURL=.*/g, os.EOL);
                    }
                });
        }

        scriptSet.es5Scripts = [
            SinglePageApplicationBundleBuilder.makePath(rootPath, path.join(path.dirname(require.resolve("babel-polyfill")), "../dist/polyfill.min.js")),
            SinglePageApplicationBundleBuilder.makePath(rootPath, es5ScriptPath)
        ];

        return scriptSet;
    }

    /**
     * Builds the package configuration for SystemJS configuration by processing the current
     * PackageInfo stack.
     *
     * @returns An object that describes the packages that should be processed by SystemJS during
     * bundling.
     */
    private async buildSystemJSPackages(): Promise<Object> {
        this._dependentPackages = new Map<string, PackageInfo>();

        let systemJSPackages = {};

        systemJSPackages["react"] = { "main": "./dist/react-with-addons.min.js", "format": "cjs" };
        systemJSPackages["react-dom"] = { "main": "./dist/react-dom.min.js", "format": "cjs" };

        while (true) {
            let currentPackageInfo = this._packageInfoStack.pop();

            if (!currentPackageInfo) break;

            if (currentPackageInfo.name === "systemjs" || currentPackageInfo.name === "react"
                || currentPackageInfo.name === "react-dom" || currentPackageInfo.name === "babel-polyfill") {

                continue;
            }
            systemJSPackages[currentPackageInfo.name] = {
                "main": currentPackageInfo.main || "./index.js",
                "format": "cjs"
            };

            if (!currentPackageInfo.dependencies) continue;

            systemJSPackages[currentPackageInfo.name]["map"] = await this.buildSystemJSPackageDependencies(currentPackageInfo.location, currentPackageInfo);
        }

        return systemJSPackages;
    }

    /**
     * Recursively builds the map configuration for a SystemJS package configuration by traversing the given
     * package's dependencies.
     *
     * @param rootPath The root path from which all found dependencies should be relative.
     * @param packageInfo The {PackageInfo} for the package that will be mapped.
     *
     * @returns An object that describes all the child dependencies of _packageInfo_ and their location
     * relative to _rootPath_.
     */
    private async buildSystemJSPackageDependencies(rootPath: string, packageInfo: PackageInfo): Promise<Object> {
        let dependencies = {};

        for (let dependency in packageInfo.dependencies) {
            let dependencyPackageInfo = await this.resolveDependentPackage(packageInfo, dependency);

            this._dependentPackages.set(dependencyPackageInfo.name, dependencyPackageInfo);

            dependencies[dependency] = SinglePageApplicationBundleBuilder.makePath(rootPath, path.join(dependencyPackageInfo.location, dependencyPackageInfo.main));

            if (dependency === "@ncorefx/fxcore") {
                // Write out the null packages that will be requested via fxcore
                dependencies["crypto"] = (dependencies["@ncorefx/fxcore"] as string).replace("/index.js", "/NullModule.js");
                dependencies["fs"] = (dependencies["@ncorefx/fxcore"] as string).replace("/index.js", "/NullModule.js");
                dependencies["path"] = (dependencies["@ncorefx/fxcore"] as string).replace("/index.js", "/NullModule.js");
                dependencies["os-locale"] = (dependencies["@ncorefx/fxcore"] as string).replace("/index.js", "/NullModule.js");
                dependencies["child_process"] = (dependencies["@ncorefx/fxcore"] as string).replace("/index.js", "/NullModule.js");
            }
            else if (dependency === "@ncorefx/fxhttp") {
                dependencies["request"] = (dependencies["@ncorefx/fxhttp"] as string).replace("/dist/index.js", "/node_modules/browser-request/index.js");

                continue; // Ignore any other dependency for 'fxhttp'
            }
            else if (dependency === "zone.js") {
                // Make sure we bundle the Browser version of zone.js
                dependencies["zone.js"] = SinglePageApplicationBundleBuilder.makePath(rootPath, path.join(dependencyPackageInfo.location, "./dist/zone.min.js"));
            }

            dependencies = Object.assign(dependencies, await this.buildSystemJSPackageDependencies(rootPath, dependencyPackageInfo));
        }

        return dependencies;
    }

    /**
     * Returns the package for a specified dependency relative to another package using Node.js resolution semantics.
     *
     * @param packageInfo The {PackageInfo} that represents the source package.
     * @param dependencyName The name of the dependency to resolve from _packageInfo_.
     *
     * @returns A promise that yields a {PackageInfo} representing the package that was found for
     * _dependencyName_.
     *
     * @throws {InvalidOperationError}
     * The specified dependency could not be resolved relative to _packageInfo_.
     */
    private async resolveDependentPackage(packageInfo: PackageInfo, dependencyName: string): Promise<PackageInfo> {
        let currentPath: string = undefined;
        let targetPath: string = packageInfo.location;
        let targetPackagePath = path.join(targetPath, "node_modules", dependencyName, "package.json");

        if (fs.existsSync(targetPackagePath)) return new PackageInfo(targetPackagePath);

        targetPath = path.resolve(targetPath, "../..");
        targetPackagePath = path.join(targetPath, "node_modules", dependencyName, "package.json");

        while (targetPath !== currentPath) {
            if (fs.existsSync(targetPackagePath)) return new PackageInfo(targetPackagePath);

            currentPath = targetPath;

            targetPath = path.resolve(targetPath, "../..");
            targetPackagePath = path.join(targetPath, "node_modules", dependencyName, "package.json");
        }

        throw new InvalidOperationError(`Could not resolve package '${dependencyName}' from '${packageInfo.location}'.`);
    }

    /**
     * Determines if the User-Agent header represents a Browser capable of running ES2015.
     *
     * @returns *true* if the User-Agent header indicates an ES2015 compatible browser;
     * otherwise *false*.
     */
    private isBrowserES2015Compatible(): boolean {
        const chromeMinMajorVersion: number = 50;

        let httpCtx = HttpContext.current;

        if (!httpCtx) return false;

        let matches = /Chrome\/(\d*)/.exec(httpCtx.request.header("User-Agent"));

        return matches
            ? parseInt(matches[1]) >= chromeMinMajorVersion
            : false;
    }

    /**
     * Returns a path where the root path is removed from the path to make.
     *
     * @param rootPath The root path.
     * @param pathToMake The path that is to be made relative to _rootPath_.
     * @param makeRelative *true* to make the path relative.
     *
     * @returns A string representing the made path from _pathToMake_ without the _rootPath.
     */
    private static makePath(rootPath: string, pathToMake: string, makeRelative: boolean = true): string {
        if (makeRelative) return `./${pathToMake.substr(rootPath.length + 1).replace(/\\/g, "/")}`;

        return `${pathToMake.substr(rootPath.length + 1).replace(/\\/g, "/")}`;
    }
}


/**
 * Encapsulates the individual set of scripts to support debug, ES2015 and ES5 scripts for the generated SPA.
 *
 * @remarks
 * The {ScriptSet} class is used privately by the {SinglePageApplicationBundleBuilder} class during
 * script generation.
 */
class ScriptSet {
    /**
     * Initializes a new {ScriptSet} object.
     */
    constructor()
    /**
     * Initializes a new {ScriptSet} object for the given set of scripts.
     *
     * @param debugScripts An array of paths representing the debug scripts.
     * @param es2015Scripts An array of paths representing the ES2015 scripts.
     * @param es5Scripts An array of paths representing the ES5 scripts.
     */
    constructor(public debugScripts?: string[], public es2015Scripts?: string[], public es5Scripts?: string[]) {
    }
}