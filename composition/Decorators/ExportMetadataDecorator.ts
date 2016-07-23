import {reflect} from "@ncorefx/core";

/**
 * Exports metadata for the decorated class.
 * 
 * @param metadataKey The metadata key.
 * @param metadataValue The value that should be exported for _metadataKey_.
 */
export function exportMetadata(metadataKey: string, metadataValue: any): ClassDecorator {
    return function (target: Function) {
        reflect.defineMetadata(metadataKey, metadataValue, target);
    }
}
