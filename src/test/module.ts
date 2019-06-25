import { Module } from '@nestjs/common';
import { ConsoleModule } from '../module';

@Module({
    imports: [ConsoleModule],
    providers: []
})
export class ConsoleModuleTest {}
