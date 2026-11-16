import { DynamicModule, Module } from '@nestjs/common';

import { ModuleWithDecoratorsTest } from './decorator/module.js';

@Module({})
export class DynamicModuleTest {
    static register(): DynamicModule {
        return {
            imports: [ModuleWithDecoratorsTest],
            module: DynamicModuleTest
        };
    }
}
