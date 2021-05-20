import { Module } from '@nestjs/common';

import { ConsoleModule } from '../../src/module';
import { ServiceTest } from './service';

@Module({
    imports: [ConsoleModule],
    providers: [ServiceTest]
})
export class ModuleTest {}
