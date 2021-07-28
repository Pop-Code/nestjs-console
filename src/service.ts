/**
 * @module ConsoleService
 */
import { INestApplicationContext, Injectable } from '@nestjs/common';
import * as commander from 'commander';

import { CreateCommandOptions, InjectCli } from './decorators';
import { CommandActionHandler, CommandActionWrapper, CommandResponse } from './interfaces';

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
    protected commands: Map<string, commander.Command> = new Map();

    /**
     * The root cli
     */
    protected cli: commander.Command;

    constructor(@InjectCli() cli: commander.Command) {
        this.cli = cli;
    }

    static createCli(name?: string): commander.Command {
        const cli = new commander.Command(name);
        cli.storeOptionsAsProperties(false);
        cli.allowUnknownOption(false);
        return cli;
    }

    /**
     * Reset the cli stack (for testing purpose only)
     */
    resetCli(): void {
        this.cli = ConsoleService.createCli();
    }

    /**
     * Get the root cli
     */
    getRootCli(): commander.Command {
        return this.cli;
    }

    /**
     * Get a cli
     * @param name Get a cli by name, if not set, the root cli is used
     */
    getCli(name?: string): commander.Command | undefined {
        let cli: commander.Command | undefined;
        if (typeof name === 'string') {
            cli = this.commands.get(name);
        } else {
            cli = this.cli;
        }
        return cli;
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
    getContainer(): INestApplicationContext | undefined {
        return this.container;
    }

    /**
     * Wrap an action handler to work with promise.
     */
    static createHandler(action: CommandActionHandler): CommandActionWrapper {
        return async (...args: any[]): Promise<CommandResponse> => {
            const command: commander.Command = args.find((c) => c instanceof commander.Command);
            let data: CommandResponse;
            if (typeof action === 'object') {
                data = action.instance[action.methodName](...args);
            } else {
                data = action(...args);
            }
            if (data instanceof Promise) {
                data = await data;
            }
            return { data, command };
        };
    }

    /**
     * Execute the cli
     */
    async init(argv: string[]): Promise<CommandResponse> {
        const userArgs = (this.cli as any)._prepareUserArgs(argv);
        return await (this.cli as any)._parseCommand([], userArgs);
    }

    /**
     * Create a Command
     *
     * @param options The options to create the commands
     * @param handler The handler of the command
     * @param parent The command to use as a parent
     */
    createCommand(
        options: CreateCommandOptions,
        handler: CommandActionHandler,
        parent: commander.Command,
        commanderOptions?: commander.CommandOptions
    ): commander.Command {
        const args = options.command.split(' ');
        const commandNames = args[0].split('.');
        const command = ConsoleService.createCli(commandNames[commandNames.length - 1]);

        if (args.length > 1) {
            command.arguments(args.slice(1).join(' '));
        }

        if (options.description !== undefined) {
            command.description(options.description);
        }
        if (options.alias !== undefined) {
            command.alias(options.alias);
        }
        if (Array.isArray(options.options)) {
            for (const opt of options.options) {
                let method = 'option';
                if (opt.required === true) {
                    method = 'requiredOption';
                }
                command[method](opt.flags, opt.description, opt.fn || opt.defaultValue, opt.defaultValue);
            }
        }
        // here as any is required cause commander bad typing on action for promise
        command.action(ConsoleService.createHandler(handler) as any);

        // add the command to the parent
        parent.addCommand(command, commanderOptions);

        // add the command to cli stack
        this.commands.set(this.getCommandFullName(command), command);

        return command;
    }

    /**
     * Create a group of command.
     * @param options The options to create the grouped command
     * @param parent The command to use as a parent
     * @throws an error if the parent command contains explicit arguments, only simple commands are allowed (no spaces)
     */
    createGroupCommand(options: CreateCommandOptions, parent: commander.Command): commander.Command {
        if ((parent as any)._args.length > 0) {
            throw new Error('Sub commands cannot be applied to command with explicit args');
        }
        const commandNames = options.command.split('.');
        const command = ConsoleService.createCli(commandNames[commandNames.length - 1]);

        if (options.description !== undefined) {
            command.description(options.description);
        }
        if (options.alias !== undefined) {
            command.alias(options.alias);
        }
        if (Array.isArray(options.options)) {
            for (const opt of options.options) {
                let method = 'option';
                if (opt.required === true) {
                    method = 'requiredOption';
                }
                command[method](opt.flags, opt.description, opt.fn || opt.defaultValue, opt.defaultValue);
            }
        }
        parent.addCommand(command);
        this.commands.set(this.getCommandFullName(command), command);
        return command;
    }

    /**
     * Get the full name of a command (parents names + command names separated by dot)
     */
    getCommandFullName(command: commander.Command): string {
        let fullName = command.name();
        let commandParent = command.parent;
        while (commandParent instanceof commander.Command && commandParent.name() !== '') {
            fullName = `${commandParent.name()}.${fullName}`;
            commandParent = commandParent.parent;
        }
        return fullName;
    }
}
