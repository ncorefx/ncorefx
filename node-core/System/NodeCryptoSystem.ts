import {ICryptoSystem, BufferLike, setCryptoSystem} from "@ncorefx/core";

import * as crypto from "crypto";

export class NodeCryptoSystem implements ICryptoSystem {
    public randomBytes(size: number): BufferLike {
        return crypto.randomBytes(size);
    }
}

setCryptoSystem(NodeCryptoSystem);
