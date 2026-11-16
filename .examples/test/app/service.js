var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@nestjs/common';
import { ConsoleService } from '../../src/service.js';
let ServiceTest = class ServiceTest {
    constructor(consoleService) {
        this.consoleService = consoleService;
        this.command = (myArgument, options, command) => {
            console.log(myArgument);
            if (options.optional !== undefined) {
                console.log(options.optional);
            }
            const parentOptions = command.parent?.opts();
            if (parentOptions?.global) {
                console.log(parentOptions.global);
            }
            return myArgument;
        };
        this.command2 = (myArgument, myArgument2) => {
            const joinedArgs = `${myArgument}::${myArgument2}`;
            console.log(joinedArgs);
            return joinedArgs;
        };
        this.commandWithNoArg = () => {
            console.log('commandWithNoArg executed');
        };
        this.subCommandWithNoArg = () => {
            console.log('subCommandWithNoArg executed');
        };
        this.asyncCommandWithNoArg = async () => {
            await new Promise((resolve) => setTimeout(() => {
                resolve(undefined);
            }, 1000));
            console.log('asyncCommandWithNoArg executed');
        };
        this.asyncSubCommandWithNoArg = async () => {
            await new Promise((resolve) => setTimeout(() => {
                resolve(undefined);
            }, 1000));
            console.log('asyncSubCommandWithNoArg executed');
        };
        this.commandWithError = (myArgument) => {
            throw new Error(myArgument);
        };
        this.asyncCommand = async (myArgument) => {
            return new Promise((resolve) => setTimeout(() => {
                console.log(myArgument);
                resolve(myArgument);
            }, 1000));
        };
        this.asyncCommandWithError = async (myArgument) => {
            await new Promise((ok, fail) => setTimeout(() => {
                fail(new Error(myArgument));
            }, 1000));
        };
        this.commandWithRequiredOption = (options) => {
            console.log(options);
            return options;
        };
        this.bindCommands();
    }
    bindCommands() {
        const cli = this.consoleService.getRootCli();
        this.consoleService.createCommand({
            command: 'command <myArgument>',
            description: 'description',
            alias: 'c',
            options: [{ flags: '-o, --optional [value]' }]
        }, { instance: this, methodName: 'command' }, cli);
        this.consoleService.createCommand({
            command: 'command2 <myArgument> <myArgument2>',
            description: 'description',
            alias: 'c2'
        }, this.command2, cli);
        this.consoleService.createCommand({
            command: 'asyncCommand <myArgument>',
            description: 'description',
            alias: 'ac'
        }, this.asyncCommand, cli);
        this.consoleService.createCommand({
            command: 'commandWithNoArg',
            description: 'description',
            alias: 'cNoArg'
        }, this.commandWithNoArg, cli);
        this.consoleService.createCommand({
            command: 'asyncCommandWithNoArg',
            description: 'description',
            alias: 'acNoArg'
        }, this.asyncCommandWithNoArg, cli);
        this.consoleService.createCommand({
            command: 'commandWithError <myArgument>',
            description: 'description',
            alias: 'cErr'
        }, this.commandWithError, cli);
        this.consoleService.createCommand({
            command: 'asyncCommandWithError <myArgument>',
            description: 'description',
            alias: 'acErr'
        }, this.asyncCommandWithError, cli);
        const subCommand = this.consoleService.createGroupCommand({
            command: 'groupCommand',
            alias: 'gc'
        }, cli);
        this.consoleService.createCommand({
            command: 'subCommand1 <myArgument>',
            alias: 'sub1',
            description: 'description',
            options: [
                {
                    flags: '-o, --optional [value]',
                    fn: (v) => (v ? true : false)
                }
            ]
        }, this.command, subCommand);
        this.consoleService.createCommand({
            command: 'asyncSubCommand1 <myArgument>',
            alias: 'acSub1',
            description: 'description'
        }, this.asyncCommand, subCommand);
        this.consoleService.createCommand({
            command: 'subCommandWithError <myArgument>',
            alias: 'subErr',
            description: 'description'
        }, this.commandWithError, subCommand);
        this.consoleService.createCommand({
            command: 'asyncSubCommandWithError <myArgument>',
            alias: 'acSubErr',
            description: 'description'
        }, this.asyncCommandWithError, subCommand);
        this.consoleService.createCommand({
            command: 'subCommandMerged <myArgument>'
        }, this.command, subCommand);
        this.consoleService.createCommand({
            command: 'subCommandWithNoArg',
            description: 'description',
            alias: 'subNoArg'
        }, this.subCommandWithNoArg, subCommand);
        this.consoleService.createCommand({
            command: 'asyncSubCommandWithNoArg',
            description: 'description',
            alias: 'acSubNoArg'
        }, this.asyncSubCommandWithNoArg, subCommand);
        this.consoleService.createCommand({
            command: 'commandWithRequiredOption',
            options: [
                {
                    flags: '-o,--requiredOptions [requiredOptions]',
                    required: true
                }
            ]
        }, this.commandWithRequiredOption, cli);
        const groupCommandWithOptions = this.consoleService.createGroupCommand({
            command: 'groupCommandWithOptions',
            options: [{ flags: '-g,--global' }]
        }, cli);
        this.consoleService.createCommand({
            command: 'commandWithGlobalOptions <myArgument>',
            options: [{ flags: '-o, --optional [value]' }]
        }, this.command, groupCommandWithOptions);
    }
};
ServiceTest = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConsoleService])
], ServiceTest);
export { ServiceTest };
