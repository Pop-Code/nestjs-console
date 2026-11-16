/**
 * @module Constants
 */
/*
 * Metadata keys of NestJS (from @nestjs/common/constants), stable since NestJS 5.
 * Copied to only import the public entry points of NestJS, a test checks they did not change.
 */
export const ROUTE_ARGS_METADATA = '__routeArguments__';
export const GUARDS_METADATA = '__guards__';
export const INTERCEPTORS_METADATA = '__interceptors__';
export const PIPES_METADATA = '__pipes__';
export const EXCEPTION_FILTERS_METADATA = '__exceptionFilters__';

/*
 * The values of RouteParamtypes.PARAM and RouteParamtypes.QUERY of NestJS,
 * that pipes receive as the "param" and "query" types
 */
const ROUTE_PARAM_TYPE_PARAM = 5;
const ROUTE_PARAM_TYPE_QUERY = 4;

/**
 * The token to store the root instance of commander
 */
export const CLI_SERVICE_TOKEN = 'nests-console.Cli';

/**
 * The key to store metadata of a Console decorator
 */
export const CONSOLE_METADATA_NAME = 'nests-console.Console';

/**
 * The key to store metadata of a Command decorator
 */
export const COMMAND_METADATA_NAME = 'nests-console.Command:';

/**
 * The key to store the options declared with the ConsoleOption decorator on a class
 */
export const CONSOLE_OPTIONS_METADATA = 'nests-console.Options';

/**
 * The type of the execution context of a command,
 * returned by `ExecutionContext.getType()` in guards, interceptors and filters
 */
export const CONSOLE_CONTEXT_TYPE = 'console';

/**
 * The context type of commands, to use with `ExecutionContext.getType<ConsoleContextType>()`
 */
export type ConsoleContextType = typeof CONSOLE_CONTEXT_TYPE;

/**
 * The types of the parameters injected by the Arg, Opt and Cmd decorators.
 * Nest passes them to the pipes as `ArgumentMetadata.type`: "param" for arguments and "query" for options,
 * so the ValidationPipe validates and transforms them like route params and query strings.
 */
export enum ConsoleParamType {
    ARGUMENT = ROUTE_PARAM_TYPE_PARAM,
    OPTION = ROUTE_PARAM_TYPE_QUERY,
    COMMAND = 100
}
