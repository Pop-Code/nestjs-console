import { Module } from '@nestjs/common';
import { ConsoleService } from './service';
import { commander } from './override/commander';

const cliProvider = {
    provide: 'Commander',
    useValue: commander
};

@Module({
    providers: [cliProvider, ConsoleService],
    exports: [ConsoleService]
})
export class ConsoleModule {}
