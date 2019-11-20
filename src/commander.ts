import { Command } from 'commander';

/**
 * A class to returns errors without exit code 1
 * Any command and sub command can throw this error.
 * The cli will display the error message with the help of the cli.
 */
export class CommandError extends Error {
    constructor(message: string, readonly command: Command) {
        super(message);
    }
}

export function createCli() {
    const cli = new Command();
    // listen for root not found
    cli.on('command:*', (args: string[], unknown: string[]) => {
        throw new CommandError(`"${args[0]}" command not found`, cli);
    });

    return cli;
}

/**
 * Callback for sub commands
 *
 * @param command The command
 * @param args The list of args returned by commander
 * @param unknown The list of unknown args returned by commander
 */
export function onSubCommand(
    command: Command,
    args: string[],
    unknown: string[]
) {
    // Trigger any releated sub command events passing the unknown args from parent
    // if command has not parent, args are the unknown args
    const commandArgs = command.parseOptions(args.concat(unknown));
    command.parseArgs(commandArgs.args, commandArgs.unknown);

    // Finally, throw an error if nothing has been done,
    // Remeber that the client must exit the process to prevent this not found to be called
    if (commandArgs.unknown.length === 0 && commandArgs.args.length === 0) {
        command.help();
    }
}
