export interface IReflectionSystem {
    getMetadata(metadataKey: any, target: Object): any;
    getMetadata(metadataKey: any, target: Object, targetKey: string | symbol): any;
    getMetadata(metadataKey: any, target: Object, targetKey?: string | symbol): any;

    getOwnMetadata(metadataKey: any, target: Object): any;
    getOwnMetadata(metadataKey: any, target: Object, targetKey: string | symbol): any;
    getOwnMetadata(metadataKey: any, target: Object, targetKey?: string | symbol): any;

    hasMetadata(metadataKey: any, target: Object): boolean;
    hasMetadata(metadataKey: any, target: Object, targetKey: string | symbol): boolean;
    hasMetadata(metadataKey: any, target: Object, targetKey?: string | symbol): boolean;

    hasOwnMetadata(metadataKey: any, target: Object): boolean;
    hasOwnMetadata(metadataKey: any, target: Object, targetKey: string | symbol): boolean;
    hasOwnMetadata(metadataKey: any, target: Object, targetKey?: string | symbol): boolean;

    defineMetadata(metadataKey: any, metadataValue: any, target: Object): void;
    defineMetadata(metadataKey: any, metadataValue: any, target: Object, targetKey: string | symbol): void;
    defineMetadata(metadataKey: any, metadataValue: any, target: Object, targetKey?: string | symbol): void;

    construct(target: Function, argumentsList: ArrayLike<any>, newTarget?: any): any;
}
