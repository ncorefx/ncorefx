import {ICryptoSystem, BufferLike, setCryptoSystem} from "@ncorefx/core";

export class ReactNativeCryptoSystem implements ICryptoSystem {
    public randomBytes(size: number): BufferLike {
        let data = new Uint8Array(size);

        crypto.getRandomValues(<Uint8Array>data);

        return data;
    }
}

setCryptoSystem(ReactNativeCryptoSystem);
