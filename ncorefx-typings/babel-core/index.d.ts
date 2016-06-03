declare namespace __BabelCore {
    interface ITransformOptios {
        presets?: string[],

        compact?: boolean;
    }

    interface IBabelTransformation {
        code: string;
    }

    function transformFileSync(filename: string, options?: ITransformOptios): IBabelTransformation;
}


declare module "babel-core" {
    export = __BabelCore;
}
