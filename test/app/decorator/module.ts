import { Module } from '@nestjs/common';

import { ConsoleModule } from '../../../src/module.js';
import { CliWithDecorator } from './cli.js';
import { CliChild } from './cli.child.js';
import { CliMergedWithNamedDecorator } from './cli.merged.js';
import { CliWithNamedDecorator } from './cli.named.js';
import { CliWithNamedDecorator2 } from './cli.named.2.js';
import { CliWithGlobalOptionDecorator } from './cli.with.global.options.js';

@Module({
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
export class ModuleWithDecoratorsTest {}
