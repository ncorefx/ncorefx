interface NodeRequire {
    (path: string): any;
    resolve(path: string): string;
}

declare var require: NodeRequire;
