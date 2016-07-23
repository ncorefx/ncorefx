export interface IPathSystem {
    join(...paths: string[]): string;

    normalize(path: string): string;

    isAbsolute(path: string): boolean;

    dirname(path: string): string;
}
