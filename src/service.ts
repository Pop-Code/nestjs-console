import { INestApplicationContext, Injectable } from '@nestjs/common';
import { Command, CommanderError } from 'commander';
import { CommandError, onSubCommand, createCli } from './commander';
import {
    IConsoleOptions,
    InjectCommander,
    ICommandDecoratorOptions
} from './decorators';
import { formatResponse } from './helpers';
import { EventEmitter } from 'events';

@Injectable()
export class ConsoleService {
    protected container: INestApplicationContext;
    protected commands: Map<string, Command> = new Map();
    protected eventManager: EventEmitter = new EventEmitter();

    constructor(@InjectCommander() protected cli: Command) {}

    /**
     * Reset the cli stack (for testing purpose only)
     */
    resetCli() {
        this.cli = createCli();
    }

    /**
     * Log an error
     * @param command The command related to the error
     * @param error The error to format
     */
    logError(command: Command, error: Error) {
        // tslint:disable-next-line:no-console
        return console.error(formatResponse(error));
    }

    /**
     * Get a cli
     * @param name Get a cli by name, if not set, the root cli is used
     */
    getCli(name?: string) {
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

    createHandler(action: (...args: any[]) => any) {
        return async (...args: any[]) => {
            try {
                let response = await action(...args);
                if (response instanceof Promise) {
                    response = await response;
                }
                this.eventManager.emit('data', response);
            } catch (e) {
                this.eventManager.emit('error', e);
            }
        };
    }

    /**
     * Execute the cli
     */
    async init(argv: string[], displayErrors: boolean): Promise<any> {
        const cli = this.getCli();
        try {
            // if nothing was provided, display an error
            if (cli.commands.length === 0) {
                throw new CommanderError(
                    1,
                    'empty',
                    `The cli does not contain sub command`
                );
            }
            const response = await new Promise((ok, fail) => {
                this.eventManager.once('data', data => {
                    ok(data);
                });
                this.eventManager.once('error', e => {
                    fail(e);
                });
                cli.exitOverride(e => {
                    throw e;
                });
                cli.parse(argv);
                if (argv.length === 2) {
                    cli.help();
                }
            });
            return response;
        } catch (e) {
            // console.log('Err', e);
            // if commander throws a CommanderError async event or help has been executed
            if (e instanceof CommanderError) {
                // ignore response and error for help display
                if (/(helpDisplayed|commander\.help)/.test(e.code)) {
                    return;
                }
                if (/missingArgument/.test(e.code)) {
                    throw e;
                }
                // display others errors
                if (displayErrors && e.exitCode === 1) {
                    this.logError(cli, e);
                }
            } else if (displayErrors) {
                this.logError(cli, e);
            }
            // always throw for promise
            throw e;
        }
    }

    createCommand(
        options: ICommandDecoratorOptions,
        handler: (...args: any[]) => any,
        parent: Command
    ) {
        const command = parent
            .command(options.command)
            .exitOverride((...args) => parent._exitCallback(...args));

        if (options.description) {
            command.description(options.description);
        }
        if (options.alias) {
            command.alias(options.alias);
        }
        if (Symbol.iterator in Object(options.options)) {
            for (const opt of options.options) {
                command.option(
                    opt.flags,
                    opt.description,
                    opt.fn,
                    opt.defaultValue
                );
            }
        }
        return command.action(this.createHandler(handler));
    }

    /**
     * Create a sub command.
     * @throws an error if the parent command contains explicit arguments, only simple commands are allowed (no spaces)
     */
    createSubCommand(options: IConsoleOptions, parent: Command): Command {
        if (parent._args.length > 0) {
            throw new Error(
                'Sub commands cannot be applied to command with explicit args'
            );
        }
        const command = parent
            .command(options.name)
            .exitOverride((...args) => parent._exitCallback(...args));
        if (options.description) {
            command.description(options.description);
        }
        if (options.alias) {
            command.alias(options.alias);
        }
        // .description(options.description)

        // .alias(options.alias);

        const name = command.name();

        // register all named events now this will prevent commander to call the event command:*
        const _onSubCommand = (args: string[], unknown: string[]) => {
            onSubCommand(command, args, unknown);
        };
        parent.on('command:' + name, _onSubCommand);
        if (options.alias) {
            parent.on('command:' + options.alias, _onSubCommand);
        }

        // listen for not found on child
        command.on('command:*', (args: string[]) => {
            throw new Error(`"${args[0]}" command not found`);
        });

        // add the command to the command Map. this will help us to manipulate parent commands
        this.commands.set(name, command);

        return command;
    }
}
