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
import { BootstrapConsole } from '../../src/bootstrap/console.js';
import { Command, Console } from '../../src/decorators.js';
import { ConsoleModule } from '../../src/module.js';
let DbCli = class DbCli {
    migrate() { }
    seed() { }
};
__decorate([
    Command({
        command: 'migrate',
        options: [{ flags: '-e, --env <env>', choices: ['dev', 'prod'] }, { flags: '--dry-run' }]
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DbCli.prototype, "migrate", null);
__decorate([
    Command({ command: 'seed', arguments: [{ name: '<size>', choices: ['small', 'large'] }] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DbCli.prototype, "seed", null);
DbCli = __decorate([
    Console({ command: 'db', description: 'Database commands' })
], DbCli);
let CompletionCliModule = class CompletionCliModule {
};
CompletionCliModule = __decorate([
    Module({ imports: [ConsoleModule], providers: [DbCli] })
], CompletionCliModule);
new BootstrapConsole({
    module: CompletionCliModule,
    useDecorators: true,
    completion: true,
    cli: { name: 'my-cli' }
}).run();
