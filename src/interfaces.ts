import { INestApplicationContext } from '@nestjs/common';
import * as commander from 'commander';

export interface IWithApplicationContext {
    setContainer(container: INestApplicationContext): IWithApplicationContext;
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
    options?: ICommandOptions[];
    commandOptions?: commander.CommandOptions;
}

export interface IMethodsMetadata {
    name: string;
    metadata: ICommandDecoratorOptions;
}

export interface IScanResponse {
    instance: any;
    metadata: IConsoleOptions;
    methods: IMethodsMetadata[];
}

export interface IConsoleOptions {
    name?: string;
    description?: string;
}
