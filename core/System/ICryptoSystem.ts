import {BufferLike} from "./BufferLike";

export interface ICryptoSystem {
    randomBytes(size: number): BufferLike;
}

export * from "./BufferLike";