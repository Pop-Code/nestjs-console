import { INestApplicationContext, Injectable } from '@nestjs/common';
import commander, { CommanderError } from 'commander';

import { ConsoleOptions, CreateCommandOptions, InjectCli } from './decorators';
import { formatResponse } from './helpers';
import { Command, CommandActionHandler, CommandActionWrapper, CommandResponse } from './interfaces';

@Injectable()
export class ConsoleService {
    /**
     * An optional instance of the application.
     * Required to scan the application
     */
    protected container?: INestApplicationContext;

    /**
     * A Map holding group commands by name
     */
    protected commands: Map<string, Command> = new Map();

    /**
     * The root cli
     */
    protected cli: Command;

    constructor(@InjectCli() cli: Command) {
        this.cli = cli;
    }

    /**
     * Create an instance of root cli
     */
    static create(): Command {
        const cli = new commander.Command();
        // listen for root not found
        // cli.on('command:*', (args: string[]) => {
        //     throw new Error(`"${args[0]}" command not found`);
        // });
        return cli;
    }

    /**
     * Reset the cli stack (for testing purpose only)
     */
    resetCli(): void {
        this.cli = ConsoleService.create();
    }

    /**
     * Log an error
     * @param command The command related to the error
     * @param error The error to format
     */
    logError(error: Error): void {
        // eslint-disable-next-line no-console
        console.error(formatResponse(error));
    }

    /**
     * Get a cli
     * @param name Get a cli by name, if not set, the root cli is used
     */
    getCli(name?: string): Command {
        return name ? this.commands.get(name) : this.cli;
    }

    /**
     * Set the container
     */
    setContainer(container: INestApplicationContext): ConsoleService {
        this.container = container;
        return this;
    }

    /**
     * Get the container
     */
    getContainer(): INestApplicationContext {
        return this.container;
    }

    /**
     * Wrap an action handler to work with promise.
     */
    createHandler(action: CommandActionHandler): CommandActionWrapper {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return async (...args: any[]): Promise<CommandResponse> => {
            const command: Command = args.find((c) => c instanceof commander.Command);
            let data = action(...args);
            if (data instanceof Promise) {
                data = await data;
            }
            return { data, command };
        };
    }

    /**
     * Execute the cli
     */
    async init(argv: string[]): Promise<CommandResponse | undefined> {
        const cli = this.getCli();
        try {
            // if nothing was provided, display an error
            if (cli.commands.length === 0) {
                throw new CommanderError(1, 'empty', 'The cli does not contain sub command');
            }
            cli.exitOverride((e) => {
                throw e;
            });
            const command = cli.parse(argv);
            const results = await Promise.all(command._actionResults as Promise<CommandResponse>[]);
            return results[0];
        } catch (e) {
            if (e instanceof CommanderError) {
                // if commander throws a CommanderError async event or help has been executed
                // ignore response and error for help display
                if (/(helpDisplayed|commander\.help)/.test(e.code)) {
                    return;
                }
                if (/(missingArgument|unknownCommand)/.test(e.code)) {
                    throw e;
                }
            }
            // display others errors
            this.logError(e);
            // always throw for promise
            throw e;
        }
    }

    /**
     * Create a Command
     *
     * @param options The options to create the commands
     * @param handler The handler of the command
     * @param parent The command to use as a parent
     */
    createCommand(options: CreateCommandOptions, handler: CommandActionHandler, parent: Command): Command {
        // const command = parent.command(options.command).exitOverride((...args) => parent._exitCallback(...args));
        const args = options.command.split(' ');
        const command = new commander.Command(args[0]);
        command.exitOverride((...args) => parent._exitCallback(...args));
        if (args.length > 1) {
            command.arguments(args[1]);
        }

        // required to avoid collision with command properties
        command.storeOptionsAsProperties(false);
        command.allowUnknownOption(false);

        if (options.description) {
            command.description(options.description);
        }
        if (options.alias) {
            command.alias(options.alias);
        }
        if (Array.isArray(options.options)) {
            for (const opt of options.options) {
                command.option(opt.flags, opt.description, opt.fn || opt.defaultValue, opt.defaultValue);
            }
        }
        // here as any is required cause commander bad typing on action for promise
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        command.action(this.createHandler(handler) as any);

        // add the command to the parent
        parent.addCommand(command);

        return command;
    }

    /**
     * Create a group of command.
     * @param options The options to create the grouped command
     * @param parent The command to use as a parent
     * @throws an error if the parent command contains explicit arguments, only simple commands are allowed (no spaces)
     */
    createGroupCommand(options: ConsoleOptions, parent: Command): Command {
        //throw new Error('Deprecated, use addCommand instead');
        if (parent._args.length > 0) {
            throw new Error('Sub commands cannot be applied to command with explicit args');
        }

        const command = new commander.Command(options.name);
        command.exitOverride((...args) => parent._exitCallback(...args));
        if (options.description) {
            command.description(options.description);
        }
        if (options.alias) {
            command.alias(options.alias);
        }

        // add the command to the service command Map. this will help us to manipulate parent commands
        this.commands.set(command.name(), command);

        // add the command to his parent
        parent.addCommand(command);

        return command;
    }
}
