import {IOSSystem, setOSSystem} from "@ncorefx/core";

export class ReactNativeOSSystem implements IOSSystem {
    public locale(): string {
        return window.navigator.language || "en-US";
    }
}

setOSSystem(ReactNativeOSSystem);
