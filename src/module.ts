import { INestApplicationContext, Module } from '@nestjs/common';
import { createCli } from './commander';
import { COMMANDER_SERVICE_TOKEN } from './constants';
import { ConsoleScanner } from './scanner';
import { ConsoleService } from './service';

const cliProvider = {
    provide: COMMANDER_SERVICE_TOKEN,
    useFactory: () => {
        return createCli();
    }
};

@Module({
    providers: [cliProvider, ConsoleService],
    exports: [ConsoleService]
})
export class ConsoleModule {
    protected scanner: ConsoleScanner = new ConsoleScanner();

    constructor(protected readonly service: ConsoleService) {}

    public scan(app: INestApplicationContext, includedModules?: any[]) {
        const scanResponse = this.scanner.scan(app, includedModules);
        const cli = this.service.getCli();
        scanResponse.forEach(({ methods, instance, metadata }) => {
            let parent = cli;
            if (metadata.name) {
                parent = this.service.getCli(metadata.name);
                if (!parent) {
                    parent = this.service.createSubCommand(metadata, cli);
                }
            }
            for (const method of methods) {
                this.service.createCommand(
                    method.metadata,
                    instance[method.name].bind(instance),
                    parent
                );
            }
        });
    }
}
