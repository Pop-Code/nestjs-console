import { Module } from '@nestjs/common';
import { ConsoleModule } from '../module';
import { ConsoleServiceTest } from './service';
import { ConsoleServiceTestAsCli } from './service.as.cli';

@Module({
    imports: [ConsoleModule],
    providers: [ConsoleServiceTest, ConsoleServiceTestAsCli]
})
export class ConsoleModuleTestWithDecorators {}
