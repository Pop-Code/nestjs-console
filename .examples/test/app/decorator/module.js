var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { ConsoleModule } from '../../../src/module.js';
import { CliWithDecorator } from './cli.js';
import { CliChild } from './cli.child.js';
import { CliMergedWithNamedDecorator } from './cli.merged.js';
import { CliWithNamedDecorator } from './cli.named.js';
import { CliWithNamedDecorator2 } from './cli.named.2.js';
import { CliWithGlobalOptionDecorator } from './cli.with.global.options.js';
let ModuleWithDecoratorsTest = class ModuleWithDecoratorsTest {
};
ModuleWithDecoratorsTest = __decorate([
    Module({
        imports: [ConsoleModule],
        providers: [
            CliWithDecorator,
            CliWithNamedDecorator,
            CliWithNamedDecorator2,
            CliMergedWithNamedDecorator,
            CliChild,
            CliWithGlobalOptionDecorator
        ]
    })
], ModuleWithDecoratorsTest);
export { ModuleWithDecoratorsTest };
