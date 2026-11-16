/**
 * @module ConsoleService
 */
import { INestApplicationContext, Injectable } from '@nestjs/common';
import * as commander from 'commander';

import { CommandArgument, CommandOption, CreateCommandOptions, HelpTextPosition, InjectCli } from './decorators';
import { CommandActionHandler, CommandActionWrapper, CommandResponse } from './interfaces';

/**
 * The options of a command that can also be applied to an existing command (eg the root cli)
 */
export type CommandSettings = Omit<CreateCommandOptions, 'command' | 'hidden' | 'isDefault'>;

/**
 * Settings that commander copies from a parent to the sub commands created with `.command()`
 * (exitOverride, configureOutput, showHelpAfterError, helpOption...).
 * Snapshot them through the public `copyInheritedSettings()` so the list follows the commander version.
 */
const getInheritableSettings = (command: commander.Command): Record<string, unknown> => {
    const probe = new commander.Command();
    probe.copyInheritedSettings(command);
    // copy plain objects (eg the output configuration), older commander versions update them in place
    return Object.fromEntries(
        Object.entries(probe).map(([key, value]) => [key, isPlainObject(value) ? { ...value } : value])
    );
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && Object.getPrototypeOf(value) === Object.prototype;

const isSameSetting = (a: unknown, b: unknown): boolean => {
    if (isPlainObject(a) && isPlainObject(b)) {
        const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
        return [...keys].every((key) => a[key] === b[key]);
    }
    return a === b;
};

const isCommanderOption = (value: unknown): value is commander.Option =>
    typeof (value as commander.Option)?.attributeName === 'function';

const isCommanderArgument = (value: unknown): value is commander.Argument =>
    typeof (value as commander.Argument)?.name === 'function';

/**
 * The arguments declared on a command (public `registeredArguments` since commander 11.1)
 */
export const getRegisteredArguments = (command: commander.Command): readonly commander.Argument[] =>
    (command as any).registeredArguments ?? (command as any)._args ?? [];

/**
 * Set the help group of a command or an option (commander >= 14)
 */
const setHelpGroup = (target: commander.Command | commander.Option, heading: string): void => {
    if (typeof (target as any).helpGroup !== 'function') {
        throw new Error('The helpGroup setting requires commander >= 14');
    }
    (target as any).helpGroup(heading);
};

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
    protected commands = new Map<string, commander.Command>();

    /**
     * The root cli
     */
    protected cli: commander.Command;

    /**
     * The settings of each command when it was created, to know which ones were changed later
     */
    protected initialSettings = new WeakMap<commander.Command, Record<string, unknown>>();

    /**
     * Receives the response of the command executed by the current `init()` call
     */
    protected onResponse?: (response: CommandResponse) => void;

    constructor(@InjectCli() cli: commander.Command) {
        this.cli = cli;
        this.trackSettings(cli);
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
        this.trackSettings(this.cli);
        this.commands.clear();
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
        return async (...args: any[]) => {
            const command: commander.Command | undefined = args.find((c) => c instanceof commander.Command);
            if (!command) {
                throw new Error('Command not found in arguments');
            }
            let data: any;
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
     *
     * Resolves with the value returned by the command handler, rejects with the error it throws.
     * If no handler is executed, `data` is undefined and `command` is the root cli.
     *
     * @param argv The arguments to parse, process.argv by default
     * @param parseOptions The commander parse options, eg `{ from: 'user' }` when argv only contains the user arguments
     */
    async init<D = any>(
        argv: readonly string[] = process.argv,
        parseOptions?: commander.ParseOptions
    ): Promise<CommandResponse<D>> {
        this.applyInheritedSettings(this.cli);
        let response: CommandResponse<D> | undefined;
        this.onResponse = (res) => {
            response = res;
        };
        try {
            await this.cli.parseAsync(argv, parseOptions);
        } finally {
            this.onResponse = undefined;
        }
        return response ?? { data: undefined as D, command: this.cli };
    }

    /**
     * Copy the settings changed on a command (exitOverride, configureOutput, showHelpAfterError...)
     * to its sub commands that did not change them, like commander does when creating sub commands with `.command()`.
     * Sub commands created by nestjs-console are created before the root cli is configured, so this runs before each parse.
     */
    protected applyInheritedSettings(parent: commander.Command): void {
        const parentInitial = this.initialSettings.get(parent);
        const parentSettings = getInheritableSettings(parent);
        for (const child of parent.commands) {
            const childInitial = this.initialSettings.get(child);
            if (parentInitial && childInitial) {
                const childSettings = getInheritableSettings(child);
                for (const [key, value] of Object.entries(parentSettings)) {
                    if (
                        !isSameSetting(value, parentInitial[key]) &&
                        isSameSetting(childSettings[key], childInitial[key])
                    ) {
                        (child as any)[key] = (parent as any)[key] ?? value;
                    }
                }
            }
            this.applyInheritedSettings(child);
        }
    }

    /**
     * Remember the settings of a new command, before it is configured
     */
    protected trackSettings(command: commander.Command): void {
        this.initialSettings.set(command, getInheritableSettings(command));
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
        this.trackSettings(command);

        if (args.length > 1) {
            command.arguments(args.slice(1).join(' '));
        }

        this.configureCommand(command, options);

        command.action(async (...actionArgs: any[]) => {
            const res = await ConsoleService.createHandler(handler)(...actionArgs);
            this.onResponse?.(res);
        });

        return this.addCommand(command, options, parent, commanderOptions);
    }

    /**
     * Create a group of command.
     * @param options The options to create the grouped command
     * @param parent The command to use as a parent
     * @throws an error if the parent command contains explicit arguments, only simple commands are allowed (no spaces)
     */
    createGroupCommand(options: CreateCommandOptions, parent: commander.Command): commander.Command {
        if (getRegisteredArguments(parent).length > 0) {
            throw new Error('Sub commands cannot be applied to command with explicit args');
        }
        const commandNames = options.command.split('.');
        const command = ConsoleService.createCli(commandNames[commandNames.length - 1]);
        this.trackSettings(command);
        this.configureCommand(command, options);
        return this.addCommand(command, options, parent);
    }

    /**
     * Apply settings to a command (description, arguments, options, help...)
     */
    configureCommand(command: commander.Command, options: CommandSettings): commander.Command {
        if (options.description !== undefined) {
            command.description(options.description);
        }
        if (options.summary !== undefined) {
            command.summary(options.summary);
        }
        if (options.usage !== undefined) {
            command.usage(options.usage);
        }
        if (options.alias !== undefined) {
            command.alias(options.alias);
        }
        for (const alias of options.aliases ?? []) {
            command.alias(alias);
        }
        for (const argument of options.arguments ?? []) {
            command.addArgument(this.createArgument(argument));
        }
        for (const option of options.options ?? []) {
            command.addOption(this.createOption(option));
        }
        if (options.helpGroup !== undefined) {
            setHelpGroup(command, options.helpGroup);
        }
        for (const [position, text] of Object.entries(options.helpText ?? {})) {
            command.addHelpText(position as HelpTextPosition, text);
        }
        if (options.allowUnknownOption !== undefined) {
            command.allowUnknownOption(options.allowUnknownOption);
        }
        if (options.allowExcessArguments !== undefined) {
            command.allowExcessArguments(options.allowExcessArguments);
        }
        if (options.passThroughOptions !== undefined) {
            command.passThroughOptions(options.passThroughOptions);
        }
        if (options.enablePositionalOptions !== undefined) {
            command.enablePositionalOptions(options.enablePositionalOptions);
        }
        if (options.showHelpAfterError !== undefined) {
            command.showHelpAfterError(options.showHelpAfterError);
        }
        if (options.showSuggestionAfterError !== undefined) {
            command.showSuggestionAfterError(options.showSuggestionAfterError);
        }
        options.configure?.(command);
        return command;
    }

    /**
     * Create a commander option from an option definition
     */
    createOption(definition: CommandOption | commander.Option): commander.Option {
        if (isCommanderOption(definition)) {
            return definition;
        }
        const option = new commander.Option(definition.flags, definition.description);
        if (definition.fn !== undefined) {
            option.argParser(definition.fn);
        }
        if (definition.defaultValue !== undefined) {
            option.default(definition.defaultValue, definition.defaultValueDescription);
        }
        if (definition.required === true) {
            option.makeOptionMandatory();
        }
        if (definition.choices !== undefined) {
            option.choices(definition.choices);
        }
        if (definition.env !== undefined) {
            option.env(definition.env);
        }
        if (definition.conflicts !== undefined) {
            option.conflicts(definition.conflicts);
        }
        if (definition.implies !== undefined) {
            option.implies(definition.implies);
        }
        if (definition.preset !== undefined) {
            option.preset(definition.preset);
        }
        if (definition.hidden === true) {
            option.hideHelp();
        }
        if (definition.helpGroup !== undefined) {
            setHelpGroup(option, definition.helpGroup);
        }
        return option;
    }

    /**
     * Create a commander argument from an argument definition
     */
    createArgument(definition: CommandArgument | commander.Argument): commander.Argument {
        if (isCommanderArgument(definition)) {
            return definition;
        }
        const argument = new commander.Argument(definition.name, definition.description);
        if (definition.fn !== undefined) {
            argument.argParser(definition.fn);
        }
        if (definition.defaultValue !== undefined) {
            argument.default(definition.defaultValue, definition.defaultValueDescription);
        }
        if (definition.choices !== undefined) {
            argument.choices(definition.choices);
        }
        return argument;
    }

    protected addCommand(
        command: commander.Command,
        options: CreateCommandOptions,
        parent: commander.Command,
        commanderOptions?: commander.CommandOptions
    ): commander.Command {
        const addOptions: commander.CommandOptions = { ...commanderOptions };
        if (options.hidden !== undefined) {
            addOptions.hidden = options.hidden;
        }
        if (options.isDefault !== undefined) {
            addOptions.isDefault = options.isDefault;
        }
        parent.addCommand(command, addOptions);
        this.commands.set(this.getCommandFullName(command), command);
        return command;
    }

    /**
     * Get the full name of a command (parents names + command names separated by dot).
     * The name of the root cli is not included.
     */
    getCommandFullName(command: commander.Command): string {
        let fullName = command.name();
        let commandParent = command.parent;
        while (commandParent instanceof commander.Command && commandParent.parent) {
            fullName = `${commandParent.name()}.${fullName}`;
            commandParent = commandParent.parent;
        }
        return fullName;
    }
}
