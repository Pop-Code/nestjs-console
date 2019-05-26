import { Module } from '@nestjs/common';
import { ConsoleService } from './service';
import { commander } from './commander';
import { COMMANDER_SERVICE_TOKEN } from './constants';

const cliProvider = {
    provide: COMMANDER_SERVICE_TOKEN,
    useValue: new commander.Command()
};

@Module({
    providers: [cliProvider, ConsoleService],
    exports: [ConsoleService]
})
export class ConsoleModule {}
