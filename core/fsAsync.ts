import * as fs from "fs";

/**
 * Provides asynchronous wrappers for the "fs" system module.
 */
export namespace fsAsync {
    export function exists(path: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            fs.exists(path, (exists: boolean) => {
                resolve(exists);
            });
        });
    }

    export function mkdir(path: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            fs.mkdir(path, (error: NodeJS.ErrnoException) => {
                if (error) return reject(error);

                resolve();
            });
        });
    }

    export function writeFile(filename: string, data: any): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            fs.writeFile(filename, data, (error: NodeJS.ErrnoException) => {
                if (error) return reject(error);

                resolve();
            });
        });
    }

    export function readFile(filename: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            fs.readFile(filename, (error: NodeJS.ErrnoException, data: Buffer) => {
                if (error) return reject(error);

                resolve(data.toString());
            });
        });
    }
}
