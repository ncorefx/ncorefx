/**
 * Represents a HTTP response message.
 */
export class HttpResponseMessage {
    private _statusCode: number;
    private _body: any;

    /**
     * Initializes a new {HttpResponseMessage} object.
     *
     * @param statusCode An optional status code.
     */
    constructor(statusCode?: number) {
        this._statusCode = statusCode || 200;
    }

    /**
     * Gets the status code of this response message.
     *
     * @returns A number indicating the status code.
     */
    public get statusCode(): number {
        return this._statusCode;
    }

    /**
     * Sets the status code.
     *
     * @param value The status code to associate with this response message.
     */
    public set statusCode(value: number) {
        this._statusCode = value;
    }

    /**
     * Gets the body of this response message.
     *
     * @returns An object representing the body of the response.
     */
    public get body(): any {
        return this._body;
    }

    /**
     * Sets the body.
     *
     * @param value The data to associate with this response message.
     */
    public set body(value: any) {
        this._body = value;
    }

    /**
     * Determines if the response message encapsulates a successful response.
     *
     * @returns *true* if the response message indicates a succesful response; otherwise *false*.
     */
    public isSuccessful(): boolean {
        return this._statusCode >= 200 && this._statusCode < 300;
    }
}
