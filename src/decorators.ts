import { Inject } from '@nestjs/common';
import { CommandOptions } from 'commander';
import {
    COMMANDER_SERVICE_TOKEN,
    COMMAND_METADATA_NAME,
    CONSOLE_METADATA_NAME
} from './constants';

export function InjectCommander() {
    return Inject(COMMANDER_SERVICE_TOKEN);
}

export interface ICommandOptions {
    flags: string;
    description?: string;
    fn?: ((arg1: any, arg2: any) => void) | RegExp;
    defaultValue?: any;
}

export interface ICommandDecoratorOptions {
    command: string;
    description?: string;
    alias?: string;
    options?: ICommandOptions[];
    commandOptions?: CommandOptions;
}
export function Command(options: ICommandDecoratorOptions) {
    return (target: any, method: string | symbol) =>
        Reflect.defineMetadata(COMMAND_METADATA_NAME, options, target, method);
}

export interface IConsoleOptions {
    name?: string;
    description?: string;
    alias?: string;
}
export function Console(options?: IConsoleOptions) {
    return (target: any) =>
        Reflect.defineMetadata(CONSOLE_METADATA_NAME, options || {}, target);
}
