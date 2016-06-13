import * as request from "request";

import {nodeGuard} from "@ncorefx/fxcore";

import {HttpResponseMessage} from "./HttpResponseMessage";

/**
 * Provides a class for sending HTTP requests and receiving HTTP responses from a resource identified by
 * a URI.
 *
 * @remarks
 * In a Browser runtime, the {HttpClient#baseAddress} property will be initialized to the base address of the
 * current browser window. When running under Node.js, no base address will be set.
 */
export class HttpClient {
    private _baseAddress: string;

    /**
     * Initializes a new {HttpClient} object.
     */
    constructor() {
        this._baseAddress = this.initializeBaseAddress();
    }

    /**
     * Gets the current base address.
     *
     * @returns A string representing the current base address.
     */
    public get baseAddress(): string {
        return this._baseAddress;
    }

    /**
     * Sets the current base address.
     *
     * @param value The new base address value.
     */
    public set baseAddress(value: string) {
        this._baseAddress = value;
    }

    public get(uri: string): Promise<HttpResponseMessage> {
        return new Promise<any>((resolve, reject) => {
            request.get(this.normalizeUri(uri), (error, response, body) => {
                let responseMessage = new HttpResponseMessage(response.statusCode);

                if (!error && response.statusCode === 200) responseMessage.body = body;

                resolve(responseMessage);
            });
        });
    }

    /**
     * Initializes the current base address.
     *
     * @returns A string representing the current base address.
     *
     * @remarks
     * For a Node.js runtime, {HttpClient#getBaseAddress} will return undefined. For a Browser runtime
     * the host portion of the current window location will be returned.
     */
    @nodeGuard()
    private initializeBaseAddress(): string {
        return undefined;
    }

    private initializeBaseAddress_Browser(): string {
        var location = window.location;

        return `${location.protocol}//${location.host}`;
    }

    /**
     * Normalizes a given URI.
     *
     * @param uri The URI to normalize.
     *
     * @returns A string that represents the normalized version of _uri_.
     *
     * @remarks
     * The value specified by _uri_ will be joined to the current {HttpClient#baseAddress} unless the supplied
     * URI represents a fully qualified URI.
     */
    private normalizeUri(uri: string): string {
        if (!this._baseAddress) return uri;

        if (/^http[s]?:\/\//.exec(uri)) return uri;

        let baseEndIdx = this._baseAddress.charAt(this._baseAddress.length) === "/" ? this._baseAddress.length - 1 : this._baseAddress.length;
        let uriStartIdx = uri.charAt(0) === "/" ? 1 : 0;

        return `${this._baseAddress.substr(0, baseEndIdx)}/${uri.substr(uriStartIdx)}`;
    }
}
