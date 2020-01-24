import { Module } from '@nestjs/common';

import { ConsoleModule } from '../../../module';
import { CliWithDecorator } from './cli';
import { CliMergedWithNamedDecorator } from './cli.merged';
import { CliWithNamedDecorator } from './cli.named';
import { CliWithNamedDecorator2 } from './cli.named.2';

@Module({
    imports: [ConsoleModule],
    providers: [
        CliWithDecorator,
        CliWithNamedDecorator,
        CliWithNamedDecorator2,
        CliMergedWithNamedDecorator
    ]
})
export class ModuleWithDecoratorsTest { }
