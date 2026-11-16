var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import * as commander from 'commander';
import { Command, Console } from '../../../src/decorators.js';
let CliWithDecorator = class CliWithDecorator {
    command(myArgument, options, command) {
        console.log(myArgument);
        if (options.optional) {
            console.log(options.optional);
        }
        const parentOptions = command.parent?.opts();
        if (parentOptions?.global) {
            console.log(parentOptions.global);
        }
        return myArgument;
    }
    async asyncCommand(myArgument) {
        return new Promise((ok) => {
            setTimeout(() => {
                console.log(myArgument);
                ok(myArgument);
            }, 0);
        });
    }
    commandWithNoArg() {
        const res = 'commandWithNoArg executed';
        console.log(res);
    }
    async asyncCommandWithNoArg() {
        console.log('asyncCommandWithNoArg executed');
        return new Promise((ok) => {
            setTimeout(() => {
                ok();
            }, 0);
        });
    }
    commandWithError(myArgument) {
        throw new Error(myArgument);
    }
    async asyncCommandWithError(myArgument) {
        return await new Promise((ok, fail) => setTimeout(() => {
            fail(new Error(myArgument));
        }, 1000));
    }
    command2(myArgument, myArgument2) {
        const joinedArgs = `${myArgument}::${myArgument2}`;
        console.log(joinedArgs);
        return joinedArgs;
    }
    commandWithRequiredOption(options) {
        console.log(options);
        return options;
    }
};
__decorate([
    Command({
        command: 'command <myArgument>',
        alias: 'c',
        description: 'description',
        options: [{ flags: '-o, --optional [value]' }]
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, commander.Command]),
    __metadata("design:returntype", String)
], CliWithDecorator.prototype, "command", null);
__decorate([
    Command({
        command: 'asyncCommand <myArgument>',
        alias: 'ac',
        description: 'description'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CliWithDecorator.prototype, "asyncCommand", null);
__decorate([
    Command({
        command: 'commandWithNoArg',
        alias: 'cNoArg',
        description: 'description'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CliWithDecorator.prototype, "commandWithNoArg", null);
__decorate([
    Command({
        command: 'asyncCommandWithNoArg',
        alias: 'acNoArg',
        description: 'description'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CliWithDecorator.prototype, "asyncCommandWithNoArg", null);
__decorate([
    Command({
        command: 'commandWithError <myArgument>',
        alias: 'cErr',
        description: 'description'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CliWithDecorator.prototype, "commandWithError", null);
__decorate([
    Command({
        command: 'asyncCommandWithError <myArgument>',
        alias: 'acErr',
        description: 'description'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CliWithDecorator.prototype, "asyncCommandWithError", null);
__decorate([
    Command({
        command: 'command2 <myArgument> <myArgument2>',
        alias: 'c2',
        description: 'description'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", String)
], CliWithDecorator.prototype, "command2", null);
__decorate([
    Command({
        command: 'commandWithRequiredOption',
        options: [
            {
                flags: '-o,--requiredOptions [requiredOptions]',
                required: true
            }
        ]
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], CliWithDecorator.prototype, "commandWithRequiredOption", null);
CliWithDecorator = __decorate([
    Console()
], CliWithDecorator);
export { CliWithDecorator };
