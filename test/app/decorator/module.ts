import { Module } from '@nestjs/common';

import { ConsoleModule } from '../../../src/module';
import { CliWithDecorator } from './cli';
import { CliChild } from './cli.child';
import { CliMergedWithNamedDecorator } from './cli.merged';
import { CliWithNamedDecorator } from './cli.named';
import { CliWithNamedDecorator2 } from './cli.named.2';
import { CliWithGlobalOptionDecorator } from './cli.with.global.options';

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
