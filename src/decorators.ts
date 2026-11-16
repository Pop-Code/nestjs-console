/**
 * @module Decorators
 */
import { Inject, PipeTransform, Type } from '@nestjs/common';
import * as commander from 'commander';

import {
    CLI_SERVICE_TOKEN,
    COMMAND_METADATA_NAME,
    CONSOLE_METADATA_NAME,
    ConsoleParamType,
    ROUTE_ARGS_METADATA
} from './constants';

export type ParserType = (value: string, previous: any) => any;

/**
 * A Param decorator to inject the root cli
 */
export const InjectCli = (): ParameterDecorator => Inject(CLI_SERVICE_TOKEN);

/**
 * The options of the command
 * @see commander .option() and the Option class to learn more
 */
export interface CommandOption {
    /**
     * The flags the command uses eg '-p,--port <port>'
     */
    flags: string;

    /**
     * The description of the option
     */
    description?: string;

    /**
     * The function to parse the value
     */
    fn?: ParserType;

    /**
     * The default value
     */
    defaultValue?: any;

    /**
     * The text displayed in the help instead of the default value
     */
    defaultValueDescription?: string;

    /**
     * True if the option is required
     */
    required?: boolean;

    /**
     * Only allow these values
     */
    choices?: readonly string[];

    /**
     * Read the value from this environment variable when the option is not passed
     */
    env?: string;

    /**
     * Names of options that cannot be used together with this one
     */
    conflicts?: string | string[];

    /**
     * Values set on other options when this option is used, eg `{ logLevel: 'debug' }`
     */
    implies?: Record<string, unknown>;

    /**
     * The value used when the option is passed without a value (option with an optional value `[value]`)
     */
    preset?: unknown;

    /**
     * Hide the option from the help
     */
    hidden?: boolean;

    /**
     * The heading of the help group the option is listed in (requires commander >= 14)
     */
    helpGroup?: string;

    /**
     * Ask the value in the terminal when the option is not passed (and the terminal is interactive).
     * `true` uses the description as question. Choices are asked with a list, options without value with yes/no.
     */
    prompt?: PromptSetting;
}

/**
 * How to ask a missing value: true (the question is the description), the question, or the question and the type of answer
 */
export type PromptSetting = boolean | string | { message?: string; password?: boolean };

/**
 * An argument of the command
 * @see commander .argument() and the Argument class to learn more
 */
export interface CommandArgument {
    /**
     * The argument eg '<file>', '[name]' or '<files...>'
     */
    name: string;

    /**
     * The description of the argument, displayed in the help
     */
    description?: string;

    /**
     * The function to parse the value
     */
    fn?: ParserType;

    /**
     * The default value (for optional arguments)
     */
    defaultValue?: any;

    /**
     * The text displayed in the help instead of the default value
     */
    defaultValueDescription?: string;

    /**
     * Only allow these values
     */
    choices?: readonly string[];

    /**
     * Ask the value in the terminal when the argument is not passed (and the terminal is interactive).
     * The argument becomes optional on the command line, and is still required if it is declared with `<name>`.
     */
    prompt?: PromptSetting;
}

/**
 * Where a help text is added
 * @see commander .addHelpText()
 */
export type HelpTextPosition = 'beforeAll' | 'before' | 'after' | 'afterAll';

/**
 * The interface to create a command
 */
export interface CreateCommandOptions {
    /**
     * The command with arguments
     *
     * eg: "mycommand <myargument> <mysecondargument>"
     * @see commander .command() method for more details
     */
    command: string;

    /**
     * The description of the command
     */
    description?: string;

    /**
     * A short description of the command, displayed in the list of commands of the parent
     */
    summary?: string;

    /**
     * Override the usage displayed in the help eg "[options] <file>"
     */
    usage?: string;

    /**
     * The alias of the command
     */
    alias?: string;

    /**
     * Other aliases of the command
     */
    aliases?: string[];

    /**
     * Arguments with a description, a parser, a default value or choices.
     * They are added after the arguments declared in `command`.
     */
    arguments?: (CommandArgument | commander.Argument)[];

    /**
     * A list of command options (plain objects or commander `Option` instances)
     */
    options?: (CommandOption | commander.Option)[];

    /**
     * Hide the command from the help
     */
    hidden?: boolean;

    /**
     * Run this command when the parent is called without a sub command
     */
    isDefault?: boolean;

    /**
     * The heading of the help group the command is listed in (requires commander >= 14)
     */
    helpGroup?: string;

    /**
     * Texts to add to the help, eg `{ after: 'Example: cli build --watch' }`
     */
    helpText?: Partial<Record<HelpTextPosition, string>>;

    /**
     * Allow options that are not declared
     */
    allowUnknownOption?: boolean;

    /**
     * Allow more arguments than declared (an error by default since commander 13)
     */
    allowExcessArguments?: boolean;

    /**
     * Pass the options after the arguments to the command instead of parsing them
     * (the parent command must use `enablePositionalOptions`)
     */
    passThroughOptions?: boolean;

    /**
     * Only parse the options placed before the sub command
     */
    enablePositionalOptions?: boolean;

    /**
     * Display the help (or a custom message) after an error
     */
    showHelpAfterError?: boolean | string;

    /**
     * Suggest similar commands or options after an error (enabled by default by commander)
     */
    showSuggestionAfterError?: boolean;

    /**
     * Configure the commander command directly, for anything not covered by these options
     */
    configure?: (command: commander.Command) => void;
}

/**
 * The Command decorator is used to decorate a method in a class
 * You can use it in a class that is decorated by a "@Console" decorator
 */
export const Command =
    (options: CreateCommandOptions): MethodDecorator =>
    (target: any, method: string | symbol): void =>
        Reflect.defineMetadata(COMMAND_METADATA_NAME, options, target, method);

/**
 * The Console decorator is used to decorate a class
 * All commands in class that are decorated by a "@Console" with identical name will be grouped
 *
 * eg "@Console({command: "mycommand"})"
 */
export const Console =
    (options?: CreateCommandOptions): ClassDecorator =>
    (target: any): void =>
        Reflect.defineMetadata(CONSOLE_METADATA_NAME, options || {}, target);

/**
 * A pipe class or instance passed to the Arg and Opt decorators
 */
export type PipeParam = Type<PipeTransform> | PipeTransform;

const isPipe = (value: unknown): value is PipeParam =>
    typeof value === 'function' || (typeof value === 'object' && value !== null && 'transform' in value);

const createConsoleParamDecorator =
    (type: ConsoleParamType) =>
    (dataOrPipe?: string | PipeParam, ...pipes: PipeParam[]): ParameterDecorator =>
    (target: object, key: string | symbol | undefined, index: number): void => {
        if (key === undefined) {
            throw new Error('nestjs-console parameter decorators can only be used on methods');
        }
        let data: string | undefined;
        if (isPipe(dataOrPipe)) {
            pipes = [dataOrPipe, ...pipes];
        } else {
            data = dataOrPipe;
        }
        const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, target.constructor, key) || {};
        Reflect.defineMetadata(
            ROUTE_ARGS_METADATA,
            { ...args, [`${type}:${index}`]: { index, data, pipes } },
            target.constructor,
            key
        );
    };

/**
 * Inject a command argument by name, eg `@Arg('file')` for a command "build <file>".
 * Without a name, all the arguments are injected as an object keyed by name.
 * Pipes run on the value, eg `@Arg('count', ParseIntPipe)`, and receive it with the type "param".
 */
export const Arg = createConsoleParamDecorator(ConsoleParamType.ARGUMENT);

/**
 * Inject a command option by name (camel cased, as returned by `command.opts()`), eg `@Opt('dryRun')` for `--dry-run`.
 * Without a name, all the options are injected (`command.opts()`).
 * Pipes run on the value, eg `@Opt('port', ParseIntPipe)`, or `@Opt(new ValidationPipe({ transform: true }))` on a DTO class,
 * and receive it with the type "query".
 */
export const Opt = createConsoleParamDecorator(ConsoleParamType.OPTION);

/**
 * Inject the commander command being executed
 */
export const Cmd = (): ParameterDecorator => createConsoleParamDecorator(ConsoleParamType.COMMAND)();
