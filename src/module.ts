import { Module, INestApplicationContext } from '@nestjs/common';
import { commander } from './commander';
import { COMMANDER_SERVICE_TOKEN } from './constants';
import { ConsoleScanner } from './scanner';
import { ConsoleService } from './service';

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

    constructor(protected readonly service: ConsoleService) {}

    public scan(app: INestApplicationContext, includedModules?: Function[]) {
        const scanResponse = this.scanner.scan(app, includedModules);
        let cli = this.service.getCli();
        scanResponse.forEach(({ methods, instance, metadata }) => {
            // if  we have a name declared on the @Console decorators
            // we register all methods under a sub command
            if (metadata.name) {
                instance._cli = this.service.subCommands(
                    cli,
                    metadata.name,
                    metadata.description
                );
            } else {
                instance._cli = cli;
            }

            for (const method of methods) {
                const command = instance._cli
                    .command(
                        method.metadata.command,
                        null,
                        method.metadata.commandOptions
                    )
                    .description(method.metadata.description);
                if (Symbol.iterator in Object(method.metadata.options)) {
                    for (const opt of method.metadata.options) {
                        command.option(
                            opt.flags,
                            opt.description,
                            opt.fn,
                            opt.defaultValue
                        );
                    }
                }
                command.action(instance[method.name].bind(instance));
            }
        });
    }
}
