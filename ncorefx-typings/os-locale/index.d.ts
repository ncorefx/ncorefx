declare module "os-locale" {
    interface IOSLocaleOptions {
        spawn: boolean;
    }

    interface OsLocaleFunction extends Function {
        (options?: IOSLocaleOptions, callback?: (error: Error, locale: string) => void);

        sync(options?: IOSLocaleOptions): string;
    }

    var osLocale: OsLocaleFunction;

    export = osLocale;
}
