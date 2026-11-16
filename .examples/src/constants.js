export const ROUTE_ARGS_METADATA = '__routeArguments__';
export const GUARDS_METADATA = '__guards__';
export const INTERCEPTORS_METADATA = '__interceptors__';
export const PIPES_METADATA = '__pipes__';
export const EXCEPTION_FILTERS_METADATA = '__exceptionFilters__';
const ROUTE_PARAM_TYPE_PARAM = 5;
const ROUTE_PARAM_TYPE_QUERY = 4;
export const CLI_SERVICE_TOKEN = 'nests-console.Cli';
export const CONSOLE_METADATA_NAME = 'nests-console.Console';
export const COMMAND_METADATA_NAME = 'nests-console.Command:';
export const CONSOLE_OPTIONS_METADATA = 'nests-console.Options';
export const CONSOLE_CONTEXT_TYPE = 'console';
export var ConsoleParamType;
(function (ConsoleParamType) {
    ConsoleParamType[ConsoleParamType["ARGUMENT"] = 5] = "ARGUMENT";
    ConsoleParamType[ConsoleParamType["OPTION"] = 4] = "OPTION";
    ConsoleParamType[ConsoleParamType["COMMAND"] = 100] = "COMMAND";
})(ConsoleParamType || (ConsoleParamType = {}));
