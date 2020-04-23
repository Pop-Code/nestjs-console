/* eslint-disable @typescript-eslint/no-explicit-any */
import commander from 'commander';

export type Command = commander.Command;

/**
 * The Command action handler type
 * Arguments are ordered this way:
 * arg1, arg2, ...otherArgs, options, command
 *
 * args: string[],
 * options: any[],
 * command: commander.Command
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
    command: Command;
}
