
export class HttpResponseMessage {
    private _statusCode: number;
    private _body: any;

    constructor(statusCode?: number) {
        this._statusCode = statusCode;
    }

    public get statusCode(): number {
        return this._statusCode;
    }

    public set statusCode(value: number) {
        this._statusCode = value;
    }

    public get body(): any {
        return this._body;
    }

    public set body(value: any) {
        this._body = value;
    }
}
