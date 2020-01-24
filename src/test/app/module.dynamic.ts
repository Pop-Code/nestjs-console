import { DynamicModule, Module } from '@nestjs/common';

import { ModuleWithDecoratorsTest } from './decorator/module';

@Module({})
export class DynamicModuleTest {
    static register(): DynamicModule {
        return {
            imports: [ModuleWithDecoratorsTest],
            module: DynamicModuleTest
        };
    }
}
