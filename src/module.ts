import { Module } from '@nestjs/common';
import { commander } from './commander';
import { COMMANDER_SERVICE_TOKEN } from './constants';
import { ConsoleScanner } from './scanner';
import { ConsoleService } from './service';
import { IScanResponse } from './interfaces';

const cliProvider = {
    provide: COMMANDER_SERVICE_TOKEN,
    useValue: new commander.Command()
};

@Module({
    providers: [cliProvider, ConsoleService],
    exports: [ConsoleService]
})
export class ConsoleModule {
    protected scanner: ConsoleScanner = new ConsoleScanner();
    protected scanResponse: Set<IScanResponse>;

    constructor(protected readonly service: ConsoleService) {}

    /**
     * Scan the application to find any @Console Decorators to register with commander
     */
    public scan(app, includedModules?: Function[]) {
        this.scanResponse = this.scanner.scan(app, includedModules);
        let cli = this.service.getCli();
        this.scanResponse.forEach(({ methods, instance, metadata }) => {
            // if  we have a name declared on the @Console decorators
            // we register all methods under a sub command
            if (metadata.name) {
                instance.cli = this.service.subCommands(
                    cli,
                    metadata.name,
                    metadata.description
                );
            } else {
                instance.cli = cli;
            }

            for (const method of methods) {
                instance.cli
                    .command(
                        method.metadata.command,
                        method.metadata.description,
                        method.metadata.options
                    )
                    .action(instance[method.name].bind(instance));
            }
        });
    }
}
