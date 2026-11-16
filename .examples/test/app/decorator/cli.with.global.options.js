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
let CliWithGlobalOptionDecorator = class CliWithGlobalOptionDecorator {
    command(myArgument, options, command) {
        console.log(myArgument);
        if (options.optional !== undefined) {
            console.log(options.optional);
        }
        const parentOptions = command.parent?.opts();
        if (parentOptions?.global) {
            console.log(parentOptions.global);
        }
        return myArgument;
    }
};
__decorate([
    Command({
        command: 'commandWithGlobalOptions <myArgument>',
        options: [{ flags: '-o, --optional [value]' }]
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, commander.Command]),
    __metadata("design:returntype", String)
], CliWithGlobalOptionDecorator.prototype, "command", null);
CliWithGlobalOptionDecorator = __decorate([
    Console({
        command: 'groupCommandWithOptions',
        options: [{ flags: '-g,--global' }]
    })
], CliWithGlobalOptionDecorator);
export { CliWithGlobalOptionDecorator };
