import {IReflectionSystem} from "./IReflectionSystem";

export class Reflection implements IReflectionSystem {
    public getMetadata(metadataKey: any, target: Object): any;
    public getMetadata(metadataKey: any, target: Object, targetKey: string | symbol): any;
    public getMetadata(metadataKey: any, target: Object, targetKey?: string | symbol): any {
        return (<any>Reflect).getOwnMetadata(metadataKey, target, targetKey);
    }

    public getOwnMetadata(metadataKey: any, target: Object): any;
    public getOwnMetadata(metadataKey: any, target: Object, targetKey: string | symbol): any;
    public getOwnMetadata(metadataKey: any, target: Object, targetKey?: string | symbol): any {
        return (<any>Reflect).getOwnMetadata(metadataKey, target, targetKey);
    }

    public hasMetadata(metadataKey: any, target: Object): boolean;
    public hasMetadata(metadataKey: any, target: Object, targetKey: string | symbol): boolean;
    public hasMetadata(metadataKey: any, target: Object, targetKey?: string | symbol): boolean {
        return (<any>Reflect).hasMetadata(metadataKey, target, targetKey);
    }

    public hasOwnMetadata(metadataKey: any, target: Object): boolean;
    public hasOwnMetadata(metadataKey: any, target: Object, targetKey: string | symbol): boolean;
    public hasOwnMetadata(metadataKey: any, target: Object, targetKey?: string | symbol): boolean {
        return (<any>Reflect).hasOwnMetadata(metadataKey, target, targetKey);
    }

    public defineMetadata(metadataKey: any, metadataValue: any, target: Object): void;
    public defineMetadata(metadataKey: any, metadataValue: any, target: Object, targetKey: string | symbol): void;
    public defineMetadata(metadataKey: any, metadataValue: any, target: Object, targetKey?: string | symbol): void {
        (<any>Reflect).defineMetadata(metadataKey, metadataValue, target, targetKey);
    }

    public construct(target: Function, argumentsList: ArrayLike<any>, newTarget?: any): any {
        return (<any>Reflect).construct(target, argumentsList, newTarget);
    }
}

export * from "./IReflectionSystem";
