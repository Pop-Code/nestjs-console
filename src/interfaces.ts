import { INestApplicationContext } from '@nestjs/common';
import * as commander from 'commander';

export interface IWithApplicationContext {
    setContainer(container: INestApplicationContext): IWithApplicationContext;
}

export interface ICommandOptions {
    command: string;
    description?: string;
    options?: commander.CommandOptions;
}

export interface IMethodsMetadata {
    name: string;
    metadata: ICommandOptions;
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
