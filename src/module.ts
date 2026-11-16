/**
 * @module ConsoleModule
 */
import { INestApplicationContext, Module } from '@nestjs/common';
import { ExternalContextCreator } from '@nestjs/core';
import * as commander from 'commander';

import {
    CLI_SERVICE_TOKEN,
    CONSOLE_CONTEXT_TYPE,
    ConsoleParamType,
    EXCEPTION_FILTERS_METADATA,
    GUARDS_METADATA,
    INTERCEPTORS_METADATA,
    PIPES_METADATA,
    ROUTE_ARGS_METADATA
} from './constants.js';
import { CreateCommandOptions, getClassOptions } from './decorators.js';
import { ConsoleParamsFactory } from './params-factory.js';
import { PromptService } from './prompt.js';
import { ConsoleScanner, ScanResponse } from './scanner.js';
import { ConsoleService } from './service.js';

const cliProvider = {
    provide: CLI_SERVICE_TOKEN,
    useFactory: (): commander.Command => ConsoleService.createCli()
};

const getDepth = ({ metadata }: ScanResponse): number =>
    metadata.command === undefined ? 0 : metadata.command.split('.').length;

@Module({
    providers: [cliProvider, ConsoleService, PromptService],
    exports: [ConsoleService, PromptService]
})
export class ConsoleModule {
    protected scanner: ConsoleScanner = new ConsoleScanner();

    protected paramsFactory = new ConsoleParamsFactory();

    constructor(protected readonly service: ConsoleService) {}

    public async scan(app: INestApplicationContext, includedModules?: unknown[]): Promise<void> {
        const scanResponse = await this.scanner.scan(app, includedModules);
        const contextCreator = app.get(ExternalContextCreator, { strict: false });

        // register parent groups before their sub groups ("parent" before "parent.child")
        const sorted = [...scanResponse].sort((a, b) => getDepth(a) - getDepth(b));
        for (const { methods, instance, metadata } of sorted) {
            const parent = this.getGroup(metadata);
            for (const method of methods) {
                this.service.createCommand(
                    this.addClassOptions(instance, method.name, method.metadata),
                    this.createHandler(contextCreator, instance, method.name),
                    parent
                );
            }
        }
    }

    /**
     * Add the options of the class injected with `@Opt()` (declared with the ConsoleOption decorator).
     * An option declared in the command with the same name is kept.
     */
    protected addClassOptions(instance: any, methodName: string, metadata: CreateCommandOptions): CreateCommandOptions {
        const params: Record<string, { index: number; data?: unknown }> =
            Reflect.getMetadata(ROUTE_ARGS_METADATA, instance.constructor, methodName) ?? {};
        const paramTypes: unknown[] = Reflect.getMetadata('design:paramtypes', instance, methodName) ?? [];
        const classOptions = Object.entries(params)
            .filter(([key, param]) => key.startsWith(`${ConsoleParamType.OPTION}:`) && param.data === undefined)
            .flatMap(([, param]) => getClassOptions(paramTypes[param.index]));
        if (classOptions.length === 0) {
            return metadata;
        }
        const options = metadata.options ?? [];
        const names = new Set(options.map((option) => this.service.createOption(option).attributeName()));
        const added = classOptions.filter((option) => !names.has(this.service.createOption(option).attributeName()));
        return { ...metadata, options: [...options, ...added] };
    }

    /**
     * Get or create the group of a "@Console" decorator (the root cli if it has no command)
     */
    protected getGroup(metadata: CreateCommandOptions): commander.Command {
        if (metadata.command === undefined) {
            return this.service.getRootCli();
        }
        const existing = this.service.getCli(metadata.command);
        if (existing !== undefined) {
            return existing;
        }
        // create the missing parent groups of "a.b.c"
        const names = metadata.command.split('.');
        let parent = this.service.getRootCli();
        for (let i = 1; i < names.length; i++) {
            const path = names.slice(0, i).join('.');
            parent = this.service.getCli(path) ?? this.service.createGroupCommand({ command: path }, parent);
        }
        return this.service.createGroupCommand(metadata, parent);
    }

    /**
     * Create the handler of a decorated method.
     *
     * If the method uses parameter decorators (Arg, Opt, Cmd...) or enhancers (UseGuards, UseInterceptors, UsePipes, UseFilters),
     * on the method or on its class, it runs in a nest execution context: the guards, interceptors, pipes and filters
     * are applied, including the global ones (APP_GUARD...).
     * Otherwise the method receives the arguments of commander, as before v12.0.0.
     */
    protected createHandler(contextCreator: ExternalContextCreator, instance: any, methodName: string) {
        return (...args: unknown[]): unknown => {
            // read on call, so the current method is used (eg after a test replaced it with a mock)
            const callback = instance[methodName];
            if (!this.usesExecutionContext(instance, callback, methodName)) {
                return callback.apply(instance, args);
            }
            // the default filter logs every error with the nest logger, only use filters when some are declared
            const filters = this.hasMetadata(EXCEPTION_FILTERS_METADATA, instance, callback);
            const handler = contextCreator.create(
                instance,
                callback,
                methodName,
                ROUTE_ARGS_METADATA,
                this.paramsFactory,
                undefined,
                undefined,
                { guards: true, interceptors: true, filters },
                CONSOLE_CONTEXT_TYPE
            );
            return handler(...args);
        };
    }

    protected usesExecutionContext(instance: any, callback: unknown, methodName: string): boolean {
        return (
            Reflect.hasMetadata(ROUTE_ARGS_METADATA, instance.constructor, methodName) ||
            [GUARDS_METADATA, INTERCEPTORS_METADATA, PIPES_METADATA, EXCEPTION_FILTERS_METADATA].some((key) =>
                this.hasMetadata(key, instance, callback)
            )
        );
    }

    protected hasMetadata(key: string, instance: any, callback: unknown): boolean {
        return (
            Reflect.hasMetadata(key, instance.constructor) ||
            (typeof callback === 'function' && Reflect.hasMetadata(key, callback))
        );
    }
}
