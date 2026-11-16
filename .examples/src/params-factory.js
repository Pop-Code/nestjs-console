import { ConsoleParamType } from './constants.js';
import { getRegisteredArguments } from './service.js';
export class ConsoleParamsFactory {
    exchangeKeyForValue(type, data, args) {
        const command = args[args.length - 1];
        switch (type) {
            case ConsoleParamType.COMMAND:
                return command;
            case ConsoleParamType.OPTION: {
                const options = args[args.length - 2];
                return data === undefined ? options : options[data];
            }
            case ConsoleParamType.ARGUMENT: {
                const names = getRegisteredArguments(command).map((argument) => argument.name());
                if (data === undefined) {
                    return Object.fromEntries(names.map((name, index) => [name, args[index]]));
                }
                const index = names.indexOf(data);
                if (index === -1) {
                    throw new Error(`The command "${command.name()}" has no argument "${data}"`);
                }
                return args[index];
            }
            default:
                return undefined;
        }
    }
}
