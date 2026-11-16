var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ConsoleService_1;
import { Injectable, Optional } from '@nestjs/common';
import * as commander from 'commander';
import { InjectCli } from './decorators.js';
import { PromptService } from './prompt.js';
const getInheritableSettings = (command) => {
    const probe = new commander.Command();
    probe.copyInheritedSettings(command);
    return { ...probe };
};
const snapshotSettings = (command) => Object.fromEntries(Object.entries(getInheritableSettings(command)).map(([key, value]) => [
    key,
    isPlainObject(value) ? { ...value } : value
]));
const isPlainObject = (value) => typeof value === 'object' && value !== null && Object.getPrototypeOf(value) === Object.prototype;
const isSameSetting = (a, b) => {
    if (isPlainObject(a) && isPlainObject(b)) {
        const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
        return [...keys].every((key) => a[key] === b[key]);
    }
    return a === b;
};
const parse = (parser, value) => parser && typeof value === 'string' ? parser(value, undefined) : value;
const isCommanderOption = (value) => typeof value?.attributeName === 'function';
const isCommanderArgument = (value) => typeof value?.name === 'function';
export const getRegisteredArguments = (command) => command.registeredArguments ?? command._args ?? [];
const setHelpGroup = (target, heading) => {
    if (typeof target.helpGroup !== 'function') {
        throw new Error('The helpGroup setting requires commander >= 14');
    }
    target.helpGroup(heading);
};
let ConsoleService = ConsoleService_1 = class ConsoleService {
    constructor(cli, prompt) {
        this.commands = new Map();
        this.initialSettings = new WeakMap();
        this.cli = cli;
        this.prompt = prompt ?? new PromptService();
        this.trackSettings(cli);
    }
    getPrompt() {
        return this.prompt;
    }
    static createCli(name) {
        const cli = new commander.Command(name);
        cli.storeOptionsAsProperties(false);
        cli.allowUnknownOption(false);
        return cli;
    }
    resetCli() {
        this.cli = ConsoleService_1.createCli();
        this.trackSettings(this.cli);
        this.commands.clear();
    }
    getRootCli() {
        return this.cli;
    }
    getCli(name) {
        let cli;
        if (typeof name === 'string') {
            cli = this.commands.get(name);
        }
        else {
            cli = this.cli;
        }
        return cli;
    }
    setContainer(container) {
        this.container = container;
        return this;
    }
    getContainer() {
        return this.container;
    }
    static createHandler(action) {
        return async (...args) => {
            const command = args.find((c) => c instanceof commander.Command);
            if (!command) {
                throw new Error('Command not found in arguments');
            }
            let data;
            if (typeof action === 'object') {
                data = action.instance[action.methodName](...args);
            }
            else {
                data = action(...args);
            }
            if (data instanceof Promise) {
                data = await data;
            }
            return { data, command };
        };
    }
    async init(argv = process.argv, parseOptions) {
        this.applyInheritedSettings(this.cli);
        let response;
        this.onResponse = (res) => {
            response = res;
        };
        try {
            await this.cli.parseAsync(argv, parseOptions);
        }
        finally {
            this.onResponse = undefined;
        }
        return response ?? { data: undefined, command: this.cli };
    }
    applyInheritedSettings(parent) {
        const parentInitial = this.initialSettings.get(parent);
        const parentSettings = getInheritableSettings(parent);
        for (const child of parent.commands) {
            const childInitial = this.initialSettings.get(child);
            if (parentInitial && childInitial) {
                const childSettings = getInheritableSettings(child);
                for (const [key, value] of Object.entries(parentSettings)) {
                    if (!isSameSetting(value, parentInitial[key]) &&
                        isSameSetting(childSettings[key], childInitial[key])) {
                        child[key] = value;
                    }
                }
            }
            this.applyInheritedSettings(child);
        }
    }
    trackSettings(command) {
        this.initialSettings.set(command, snapshotSettings(command));
    }
    createCommand(options, handler, parent, commanderOptions) {
        const args = options.command.split(' ');
        const commandNames = args[0].split('.');
        const command = ConsoleService_1.createCli(commandNames[commandNames.length - 1]);
        this.trackSettings(command);
        if (args.length > 1) {
            command.arguments(args.slice(1).join(' '));
        }
        this.configureCommand(command, options);
        command.action(async (...actionArgs) => {
            const res = await ConsoleService_1.createHandler(handler)(...actionArgs);
            this.onResponse?.(res);
        });
        return this.addCommand(command, options, parent, commanderOptions);
    }
    createGroupCommand(options, parent) {
        if (getRegisteredArguments(parent).length > 0) {
            throw new Error('Sub commands cannot be applied to command with explicit args');
        }
        const commandNames = options.command.split('.');
        const command = ConsoleService_1.createCli(commandNames[commandNames.length - 1]);
        this.trackSettings(command);
        this.configureCommand(command, options);
        return this.addCommand(command, options, parent);
    }
    configureCommand(command, options) {
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
        const promptedArguments = [];
        for (const definition of options.arguments ?? []) {
            const argument = this.createArgument(definition);
            if (!isCommanderArgument(definition) && definition.prompt) {
                promptedArguments.push({ index: getRegisteredArguments(command).length, argument, definition });
            }
            command.addArgument(argument);
        }
        const promptedOptions = [];
        for (const definition of options.options ?? []) {
            const option = this.createOption(definition);
            if (!isCommanderOption(definition) && definition.prompt) {
                promptedOptions.push({ option, definition });
            }
            command.addOption(option);
        }
        if (promptedArguments.length > 0 || promptedOptions.length > 0) {
            command.hook('preAction', () => this.askMissingValues(command, promptedArguments, promptedOptions));
        }
        if (options.helpGroup !== undefined) {
            setHelpGroup(command, options.helpGroup);
        }
        for (const [position, text] of Object.entries(options.helpText ?? {})) {
            command.addHelpText(position, text);
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
    createOption(definition) {
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
        if (definition.required === true && !definition.prompt) {
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
    createArgument(definition) {
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
        if (definition.prompt) {
            argument.argOptional();
        }
        return argument;
    }
    async askMissingValues(command, promptedArguments, promptedOptions) {
        const interactive = this.prompt.isInteractive();
        for (const { index, argument, definition } of promptedArguments) {
            const current = command.processedArgs[index];
            if (current !== undefined && !(argument.variadic && Array.isArray(current) && current.length === 0)) {
                continue;
            }
            if (!interactive) {
                if (definition.name.startsWith('<')) {
                    command.error(`error: missing required argument '${argument.name()}'`, {
                        code: 'commander.missingArgument'
                    });
                }
                continue;
            }
            const answer = await this.askValue(definition.prompt, definition.description ?? argument.name(), {
                choices: argument.argChoices
            });
            const value = argument.variadic ? String(answer).split(/\s+/).filter(Boolean) : answer;
            command.processedArgs[index] = parse(argument.parseArg, value);
        }
        for (const { option, definition } of promptedOptions) {
            const name = option.attributeName();
            const source = command.getOptionValueSource(name);
            if (source !== undefined && source !== 'default') {
                continue;
            }
            if (!interactive) {
                if (definition.required) {
                    command.error(`error: required option '${option.flags}' not specified`, {
                        code: 'commander.missingMandatoryOptionValue'
                    });
                }
                continue;
            }
            const current = command.getOptionValue(name);
            const answer = await this.askValue(definition.prompt, definition.description ?? option.long ?? option.flags, {
                choices: option.argChoices,
                flag: !option.required && !option.optional,
                default: option.negate ? current === false : current
            });
            const value = typeof answer === 'boolean' ? answer !== option.negate : parse(option.parseArg, answer);
            command.setOptionValueWithSource(name, value, 'cli');
        }
    }
    askValue(setting, description, { choices, flag, default: defaultValue }) {
        const message = typeof setting === 'string' ? setting : (typeof setting === 'object' && setting.message) || description;
        if (flag) {
            return this.prompt.confirm(message, defaultValue === true);
        }
        const fallback = defaultValue === undefined ? undefined : String(defaultValue);
        if (choices?.length) {
            return this.prompt.select(message, choices, { default: fallback });
        }
        if (typeof setting === 'object' && setting.password) {
            return this.prompt.password(message);
        }
        return this.prompt.input(message, { default: fallback });
    }
    addCommand(command, options, parent, commanderOptions) {
        const addOptions = { ...commanderOptions };
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
    getCommandFullName(command) {
        let fullName = command.name();
        let commandParent = command.parent;
        while (commandParent instanceof commander.Command && commandParent.parent) {
            fullName = `${commandParent.name()}.${fullName}`;
            commandParent = commandParent.parent;
        }
        return fullName;
    }
};
ConsoleService = ConsoleService_1 = __decorate([
    Injectable(),
    __param(0, InjectCli()),
    __param(1, Optional()),
    __metadata("design:paramtypes", [commander.Command, PromptService])
], ConsoleService);
export { ConsoleService };
