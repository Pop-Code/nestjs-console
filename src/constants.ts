/**
 * @module Constants
 */
import { RouteParamtypes } from '@nestjs/common/enums/route-paramtypes.enum';

export {
    EXCEPTION_FILTERS_METADATA,
    GUARDS_METADATA,
    INTERCEPTORS_METADATA,
    PIPES_METADATA,
    ROUTE_ARGS_METADATA
} from '@nestjs/common/constants';

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
    ARGUMENT = RouteParamtypes.PARAM,
    OPTION = RouteParamtypes.QUERY,
    COMMAND = 100
}
