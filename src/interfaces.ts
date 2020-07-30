/* eslint-disable @typescript-eslint/no-explicit-any */
import * as commander from 'commander';

/**
 * The Command action handler type
 * Arguments are ordered this way:
 * arg1, arg2, ...otherArgs, command
 *
 * args: any[],
 * command: commander.Command
 *
 * storeOptionsAsProperties is set to false, to get options, use command.opts()
 */
export type CommandActionHandler = (...args: any[]) => any | Promise<any>;

/**
 * The wrapper type of a Command action handler
 * Note: The last argument is always the command
 */
export type CommandActionWrapper = (...args: any[]) => Promise<CommandResponse>;

/**
 * The response of the
 */
export interface CommandResponse {
    data: any;
    command: commander.Command;
}
