import { Module } from '@nestjs/common';
import { ConsoleModule } from '../module';
@Module({
    imports: [ConsoleModule]
})
export class ConsoleModuleTest {}
