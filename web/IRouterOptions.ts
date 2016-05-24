/**
 * Provides optional parameters to specify the behaviour of a router.
 */
export interface IRouterOptions {
    /**
     * *true* to enable case sensitivity.
     *
     * @remarks
     * *false* by default, treating '/Foo/' and the '/foo' as the same.
     */
    caseSensitive?: boolean;

    /**
     * *true* to preserve the the 'req.params' values from the parent router. If the parent and
     * the child router have conflicting param names then the child's value takes precedence.
     */
    mergeParams?: boolean;

    /**
     * *true* to enable strict routing.
     *
     * @remarks
     * *false* by default, '/foo' and '/foo/' are treated the same.
     */
    strict?: boolean;
}
