import {IPathSystem} from "./IPathSystem";
import {ICryptoSystem} from "./ICryptoSystem";
import {IOSSystem} from "./IOSSystem";
import {IReflectionSystem, Reflection} from "./Reflection";
import {IPackageSystem, PackageSystem} from "./PackageSystem";

var path: IPathSystem;
var crypto: ICryptoSystem;
var os: IOSSystem;

export const reflect: IReflectionSystem = new Reflection();
export const packageSys: IPackageSystem = new PackageSystem();

export function setPathSystem(pathSystem: { new(): IPathSystem }): void {
    path = new pathSystem();
}

export function getPathSystem(): IPathSystem {
    return path;
}

export function setCryptoSystem(cryptoSystem: { new(): ICryptoSystem }): void {
    crypto = new cryptoSystem();
}

export function getCryptoSystem(): ICryptoSystem {
    return crypto;
}

export function setOSSystem(osSystem: { new(): IOSSystem }): void {
    os = new osSystem();
}

export function getOSSystem(): IOSSystem {
    return os;
}

export * from "./IPathSystem";
export * from "./ICryptoSystem";
export * from "./IOSSystem";
export * from "./IPackageSystem";
