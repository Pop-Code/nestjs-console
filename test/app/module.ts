import { Module } from '@nestjs/common';

import { ConsoleModule } from '../../src/module.js';
import { ServiceTest } from './service.js';

@Module({
    imports: [ConsoleModule],
    providers: [ServiceTest]
})
export class ModuleTest {}
