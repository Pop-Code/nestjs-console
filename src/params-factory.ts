/**
 * @module ConsoleParamsFactory
 */
import * as commander from 'commander';

import { ConsoleParamType } from './constants';
import { getRegisteredArguments } from './service';

/**
 * Get the values of the parameters decorated with Arg, Opt and Cmd
 * from the arguments commander passes to the action handler: (...arguments, options, command)
 */
export class ConsoleParamsFactory {
    exchangeKeyForValue(type: number, data: any, args: any): unknown {
        const command = args[args.length - 1] as commander.Command;
        switch (type) {
            case ConsoleParamType.COMMAND:
                return command;
            case ConsoleParamType.OPTION: {
                const options = args[args.length - 2] as Record<string, unknown>;
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
