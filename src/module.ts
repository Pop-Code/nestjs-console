import { INestApplicationContext, Module } from '@nestjs/common';
import * as commander from 'commander';

import { CLI_SERVICE_TOKEN } from './constants';
import { ConsoleScanner } from './scanner';
import { ConsoleService } from './service';

const cliProvider = {
    provide: CLI_SERVICE_TOKEN,
    useFactory: (): commander.Command => ConsoleService.create()
};

@Module({
    providers: [cliProvider, ConsoleService],
    exports: [ConsoleService]
})
export class ConsoleModule {
    protected scanner: ConsoleScanner = new ConsoleScanner();

    constructor(protected readonly service: ConsoleService) {}

    public async scan(app: INestApplicationContext, includedModules?: unknown[]): Promise<void> {
        const scanResponse = await this.scanner.scan(app, includedModules);
        const cli = this.service.getCli();
        scanResponse.forEach(({ methods, instance, metadata }) => {
            let parent = cli;
            if (metadata.name) {
                parent = this.service.getCli(metadata.name);
                if (!parent) {
                    parent = this.service.createGroupCommand(metadata, cli);
                }
            }
            for (const method of methods) {
                this.service.createCommand(method.metadata, instance[method.name].bind(instance), parent);
            }
        });
    }
}
