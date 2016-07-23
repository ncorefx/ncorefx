import {ICryptoSystem, BufferLike, setCryptoSystem} from "@ncorefx/core";

declare var msCrypto: Crypto;

export class WebCryptoSystem implements ICryptoSystem {
    public randomBytes(size: number): BufferLike {
        if (typeof Uint8Array === "function") {
            let data = new Uint8Array(size);

            if (typeof crypto !== "undefined") {
                crypto.getRandomValues(<Uint8Array>data);
            }
            else if (typeof msCrypto !== "undefined") {
                msCrypto.getRandomValues(<Uint8Array>data);
            }
            else {
                WebCryptoSystem.fillRandomBytes(data, size);
            }

            return data;
        }
        else {
            let data = new Array(size);

            WebCryptoSystem.fillRandomBytes(data, size);
            
            return data;
        }
    }

    private static fillRandomBytes(buffer: BufferLike, size: number): void {
        for (var i = 0; i < size; i++) {
            buffer[i] = Math.random() * 255 | 0;
        }
    }
}

setCryptoSystem(WebCryptoSystem);
