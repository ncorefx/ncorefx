import * as React from "react";
import {AppRegistry} from "react-native";

export abstract class Application<TState> {
    private _appKey: string;

    constructor(appKey: string) {
        this._appKey = appKey;
    }

    public async start(): Promise<void> {
        let applicationState = await this.onInitialize();
        let applicationComponent = await this.onGetRootComponent(applicationState);

        AppRegistry.registerComponent(this._appKey, () => applicationComponent);
    }

    protected async onInitialize(): Promise<TState> {
        return undefined;
    }

    protected abstract async onGetRootComponent(state: TState): Promise<React.ComponentClass<any>>;
}
