declare module "intl-messageformat" {
    class IntlMessageFormat {
        constructor(message: string, locales: string | string[], formats?: any)
        format(context?: any): string
    }

    export = IntlMessageFormat;
}
