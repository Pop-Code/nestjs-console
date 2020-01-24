import { Command } from 'commander';

/**
 * The Command action handler type
 * Note: The last argument is always the command
 */
export type CommandActionHandler = (...args: any[]) => any | Promise<any>;

/**
 * The wrapper type of a Command action handler
 * Note: The last argument is always the command
 */
export type CommandActionWrapper = (...args: any[]) => Promise<ICommandResponse>;


/**
 * The response of the
 */
export interface ICommandResponse {
    data: any;
    command: Command;
}
