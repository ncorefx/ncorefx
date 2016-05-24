/**
 * Enumerates the HTTP verbs.
 */
export enum HttpVerbs {
    /**
     * Retrieves the information or entity that is identified by the URI of the request.
     */
    Get,

    /**
     * Posts a new entity as an addition to a URI.
     */
    Post,

    /**
     * Replaces an entity that is identified by a URI.
     */
    Put,

    /**
     * Requests that a specified URI be deleted.
     */
    Delete,

    /**
     * Requests that a set of changes described in the request entity be applied
     * to the resource identified by the URI of the request.
     */
    Patch,

    /**
     * Represents a request for information about the communication options available on
     * the request/response chain identified by the URI of the request.
     */
    Options,

    /**
     * Retrieves the message headers for the information or entity that is identified by the
     * URI of the request.
     */
    Head
}
