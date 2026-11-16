import { Inject } from '@nestjs/common';
import * as commander from 'commander';
import { CLI_SERVICE_TOKEN, COMMAND_METADATA_NAME, CONSOLE_METADATA_NAME, CONSOLE_OPTIONS_METADATA, ConsoleParamType, ROUTE_ARGS_METADATA } from './constants.js';
export const InjectCli = () => Inject(CLI_SERVICE_TOKEN);
export const Command = (options) => (target, method) => Reflect.defineMetadata(COMMAND_METADATA_NAME, options, target, method);
export const Console = (options) => (target) => Reflect.defineMetadata(CONSOLE_METADATA_NAME, options || {}, target);
const isPipe = (value) => typeof value === 'function' || (typeof value === 'object' && value !== null && 'transform' in value);
const createConsoleParamDecorator = (type) => (dataOrPipe, ...pipes) => (target, key, index) => {
    if (key === undefined) {
        throw new Error('nestjs-console parameter decorators can only be used on methods');
    }
    let data;
    if (isPipe(dataOrPipe)) {
        pipes = [dataOrPipe, ...pipes];
    }
    else {
        data = dataOrPipe;
    }
    const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, target.constructor, key) || {};
    Reflect.defineMetadata(ROUTE_ARGS_METADATA, { ...args, [`${type}:${index}`]: { index, data, pipes } }, target.constructor, key);
};
export const Arg = createConsoleParamDecorator(ConsoleParamType.ARGUMENT);
export const Opt = createConsoleParamDecorator(ConsoleParamType.OPTION);
export const Cmd = () => createConsoleParamDecorator(ConsoleParamType.COMMAND)();
export const ConsoleOption = (definition = {}) => (target, property) => {
    if (typeof property !== 'string') {
        throw new Error('ConsoleOption can only decorate properties with a string name');
    }
    const options = [
        ...(Reflect.getMetadata(CONSOLE_OPTIONS_METADATA, target.constructor) ?? [])
    ];
    options.push({ property, type: Reflect.getMetadata('design:type', target, property), definition });
    Reflect.defineMetadata(CONSOLE_OPTIONS_METADATA, options, target.constructor);
};
const toKebabCase = (name) => name.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
const parseNumber = (value) => {
    const number = Number(value);
    if (value.trim() === '' || Number.isNaN(number)) {
        throw new commander.InvalidArgumentError('Not a number.');
    }
    return number;
};
export const getClassOptions = (type) => {
    const options = typeof type === 'function' ? (Reflect.getMetadata(CONSOLE_OPTIONS_METADATA, type) ?? []) : [];
    return options.map(({ property, type: propertyType, definition }) => {
        const { flags, short, ...option } = definition;
        const name = toKebabCase(property);
        const value = propertyType === Boolean ? '' : propertyType === Array ? ` <${name}...>` : ` <${name}>`;
        return {
            ...option,
            flags: flags ?? [short && `-${short}`, `--${name}${value}`].filter(Boolean).join(', '),
            fn: option.fn ?? (propertyType === Number ? parseNumber : undefined)
        };
    });
};
