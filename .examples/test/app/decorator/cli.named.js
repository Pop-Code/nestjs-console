var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Command, Console } from '../../../src/decorators.js';
let CliWithNamedDecorator = class CliWithNamedDecorator {
    subCommand1(myArgument, options) {
        console.log(myArgument);
        if (options.optional) {
            console.log(options.optional);
        }
        return myArgument;
    }
    async asyncSubCommand1(myArgument) {
        return new Promise((ok) => {
            setTimeout(() => {
                console.log(myArgument);
                ok(myArgument);
            }, 0);
        });
    }
    subCommandWithError(myArgument) {
        throw new Error(myArgument);
    }
    async asyncSubCommandWithError(myArgument) {
        await new Promise((ok, fail) => setTimeout(() => {
            fail(new Error(myArgument));
        }, 1000));
    }
    subCommandWithNoArg() {
        console.log('subCommandWithNoArg executed');
    }
    async asyncSubCommandWithNoArg() {
        await new Promise((resolve) => setTimeout(() => {
            resolve(undefined);
        }, 3000));
        console.log('asyncSubCommandWithNoArg executed');
    }
};
__decorate([
    Command({
        command: 'subCommand1 <myArgument>',
        alias: 'sub1',
        description: 'description',
        options: [
            {
                flags: '-o, --optional [value]',
                fn: (v) => (v ? true : false)
            }
        ]
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", String)
], CliWithNamedDecorator.prototype, "subCommand1", null);
__decorate([
    Command({
        command: 'asyncSubCommand1 <myArgument>',
        alias: 'acSub1',
        description: 'description'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CliWithNamedDecorator.prototype, "asyncSubCommand1", null);
__decorate([
    Command({
        command: 'subCommandWithError <myArgument>',
        alias: 'subErr',
        description: 'description'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", String)
], CliWithNamedDecorator.prototype, "subCommandWithError", null);
__decorate([
    Command({
        command: 'asyncSubCommandWithError <myArgument>',
        alias: 'acSubErr',
        description: 'description'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CliWithNamedDecorator.prototype, "asyncSubCommandWithError", null);
__decorate([
    Command({
        command: 'subCommandWithNoArg',
        alias: 'subNoArg',
        description: 'description'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CliWithNamedDecorator.prototype, "subCommandWithNoArg", null);
__decorate([
    Command({
        command: 'asyncSubCommandWithNoArg',
        alias: 'acSubNoArg',
        description: 'description'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CliWithNamedDecorator.prototype, "asyncSubCommandWithNoArg", null);
CliWithNamedDecorator = __decorate([
    Console({
        command: 'groupCommand',
        alias: 'gc'
    })
], CliWithNamedDecorator);
export { CliWithNamedDecorator };
