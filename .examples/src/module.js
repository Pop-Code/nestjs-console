var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Module } from '@nestjs/common';
import { ExternalContextCreator } from '@nestjs/core';
import { CLI_SERVICE_TOKEN, CONSOLE_CONTEXT_TYPE, ConsoleParamType, EXCEPTION_FILTERS_METADATA, GUARDS_METADATA, INTERCEPTORS_METADATA, PIPES_METADATA, ROUTE_ARGS_METADATA } from './constants.js';
import { getClassOptions } from './decorators.js';
import { ConsoleParamsFactory } from './params-factory.js';
import { PromptService } from './prompt.js';
import { ConsoleScanner } from './scanner.js';
import { ConsoleService } from './service.js';
const cliProvider = {
    provide: CLI_SERVICE_TOKEN,
    useFactory: () => ConsoleService.createCli()
};
const getDepth = ({ metadata }) => metadata.command === undefined ? 0 : metadata.command.split('.').length;
let ConsoleModule = class ConsoleModule {
    constructor(service) {
        this.service = service;
        this.scanner = new ConsoleScanner();
        this.paramsFactory = new ConsoleParamsFactory();
    }
    async scan(app, includedModules) {
        const scanResponse = await this.scanner.scan(app, includedModules);
        const contextCreator = app.get(ExternalContextCreator, { strict: false });
        const sorted = [...scanResponse].sort((a, b) => getDepth(a) - getDepth(b));
        for (const { methods, instance, metadata } of sorted) {
            const parent = this.getGroup(metadata);
            for (const method of methods) {
                this.service.createCommand(this.addClassOptions(instance, method.name, method.metadata), this.createHandler(contextCreator, instance, method.name), parent);
            }
        }
    }
    addClassOptions(instance, methodName, metadata) {
        const params = Reflect.getMetadata(ROUTE_ARGS_METADATA, instance.constructor, methodName) ?? {};
        const paramTypes = Reflect.getMetadata('design:paramtypes', instance, methodName) ?? [];
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
    getGroup(metadata) {
        if (metadata.command === undefined) {
            return this.service.getRootCli();
        }
        const existing = this.service.getCli(metadata.command);
        if (existing !== undefined) {
            return existing;
        }
        const names = metadata.command.split('.');
        let parent = this.service.getRootCli();
        for (let i = 1; i < names.length; i++) {
            const path = names.slice(0, i).join('.');
            parent = this.service.getCli(path) ?? this.service.createGroupCommand({ command: path }, parent);
        }
        return this.service.createGroupCommand(metadata, parent);
    }
    createHandler(contextCreator, instance, methodName) {
        return (...args) => {
            const callback = instance[methodName];
            if (!this.usesExecutionContext(instance, callback, methodName)) {
                return callback.apply(instance, args);
            }
            const filters = this.hasMetadata(EXCEPTION_FILTERS_METADATA, instance, callback);
            const handler = contextCreator.create(instance, callback, methodName, ROUTE_ARGS_METADATA, this.paramsFactory, undefined, undefined, { guards: true, interceptors: true, filters }, CONSOLE_CONTEXT_TYPE);
            return handler(...args);
        };
    }
    usesExecutionContext(instance, callback, methodName) {
        return (Reflect.hasMetadata(ROUTE_ARGS_METADATA, instance.constructor, methodName) ||
            [GUARDS_METADATA, INTERCEPTORS_METADATA, PIPES_METADATA, EXCEPTION_FILTERS_METADATA].some((key) => this.hasMetadata(key, instance, callback)));
    }
    hasMetadata(key, instance, callback) {
        return (Reflect.hasMetadata(key, instance.constructor) ||
            (typeof callback === 'function' && Reflect.hasMetadata(key, callback)));
    }
};
ConsoleModule = __decorate([
    Module({
        providers: [cliProvider, ConsoleService, PromptService],
        exports: [ConsoleService, PromptService]
    }),
    __metadata("design:paramtypes", [ConsoleService])
], ConsoleModule);
export { ConsoleModule };
