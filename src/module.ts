/**
 * @module ConsoleModule
 */
import { INestApplicationContext, Module } from '@nestjs/common';
import * as commander from 'commander';

import { CLI_SERVICE_TOKEN } from './constants';
import { ConsoleScanner } from './scanner';
import { ConsoleService } from './service';

const cliProvider = {
    provide: CLI_SERVICE_TOKEN,
    useFactory: (): commander.Command => ConsoleService.createCli()
};

@Module({
    providers: [cliProvider, ConsoleService],
    exports: [ConsoleService]
})
export class ConsoleModule {
    protected scanner: ConsoleScanner = new ConsoleScanner();

    constructor(protected readonly service: ConsoleService) {}

    public scan(app: INestApplicationContext, includedModules?: unknown[]): void {
        const scanResponse = this.scanner.scan(app, includedModules);
        const cli = this.service.getRootCli();
        scanResponse.forEach(({ methods, instance, metadata }) => {
            let parent: commander.Command = cli;
            let subCli = this.service.getCli(metadata.command);
            if (subCli !== undefined) {
                parent = subCli;
            } else {
                const commandNames = metadata.command.split('.');
                if (commandNames.length > 1) {
                    commandNames.pop();
                    subCli = this.service.getCli(commandNames.join('.'));
                }
                if (subCli === undefined) {
                    parent = this.service.createGroupCommand(metadata, cli);
                } else {
                    parent = this.service.createGroupCommand(metadata, subCli);
                }
            }
            for (const method of methods) {
                this.service.createCommand(method.metadata, { instance, methodName: method.name }, parent);
            }
        });
    }
}
