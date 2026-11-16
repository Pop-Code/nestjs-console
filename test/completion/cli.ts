import { Module } from '@nestjs/common';

import { BootstrapConsole } from '../../src/bootstrap/console.js';
import { Command, Console } from '../../src/decorators.js';
import { ConsoleModule } from '../../src/module.js';

@Console({ command: 'db', description: 'Database commands' })
class DbCli {
    @Command({
        command: 'migrate',
        options: [{ flags: '-e, --env <env>', choices: ['dev', 'prod'] }, { flags: '--dry-run' }]
    })
    migrate() {}

    @Command({ command: 'seed', arguments: [{ name: '<size>', choices: ['small', 'large'] }] })
    seed() {}
}

@Module({ imports: [ConsoleModule], providers: [DbCli] })
class CompletionCliModule {}

new BootstrapConsole({
    module: CompletionCliModule,
    useDecorators: true,
    completion: true,
    cli: { name: 'my-cli' }
}).run();
