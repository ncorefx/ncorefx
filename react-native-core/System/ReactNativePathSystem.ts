import {IPathSystem, setPathSystem} from "@ncorefx/core";

// https://github.com/substack/path-browserify/blob/master/index.js
export class ReactNativePathSystem implements IPathSystem {
    private static PathRegExp: RegExp = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;

    public join(...paths: string[]): string {
        return this.normalize(paths.join('/'));
    }

    public normalize(path: string): string {
        function normalizeSegments(segments: string[], allowAboveRoot: boolean): string[] {
            // if the path tries to go above the root, `up` ends up > 0
            let up = 0;

            for (let segmentIdx = segments.length - 1; segmentIdx >= 0; segmentIdx--) {
                let last = segments[segmentIdx];

                if (last === '.') {
                    segments.splice(segmentIdx, 1);
                }
                else if (last === '..') {
                    segments.splice(segmentIdx, 1);

                    up++;
                }
                else if (up) {
                    segments.splice(segmentIdx, 1);

                    up--;
                }
            }

            // if the path is allowed to go above the root, restore leading ".."s
            if (allowAboveRoot) {
                for (; up--; up) {
                    segments.unshift('..');
                }
            }

            return segments;
        }

        let isAbsolute = this.isAbsolute(path);
        let hasTrailingSlash = path.charAt(0) === '/';

        path = normalizeSegments(path.split('/').filter((p) => !!p), !isAbsolute).join('/');

        if (!path && !isAbsolute) {
            path = '.';
        }
        if (path && hasTrailingSlash) {
            path += '/';
        }

        return (isAbsolute ? '/' : '') + path;
    }

    public isAbsolute(path: string): boolean {
        return path.charAt(0) === '/';
    }

    public dirname(path: string): string {
        let result = this.splitPath(path);
        let root = result[0];
        let dir = result[1];

        if (!root && !dir) return '.';

        if (dir) {
            dir = dir.substr(0, dir.length - 1);
        }

        return root + dir;
    }

    /**
     * Splits a path into its component parts.
     * 
     * @param path The path that should be split.
     * 
     * @returns An array ([root, dir, basename, ext]).
     */
    private splitPath(path: string): string[] {
        return ReactNativePathSystem.PathRegExp.exec(path).slice(1);
    }
}

setPathSystem(ReactNativePathSystem);
