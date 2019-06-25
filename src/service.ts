import { INestApplicationContext, Injectable } from '@nestjs/common';
import * as ora from 'ora';
import { Command, forwardSubCommands } from './commander';
import { InjectCommander } from './decorators';
import { IWithApplicationContext } from './interfaces';

@Injectable()
export class ConsoleService implements IWithApplicationContext {
    protected container: INestApplicationContext;

    constructor(@InjectCommander() protected readonly cli: Command) {}

    static createSpinner(text?: string) {
        return ora.default(text);
    }

    getCli() {
        return this.cli;
    }

    setContainer(container: INestApplicationContext): IWithApplicationContext {
        this.container = container;
        return this;
    }

    getContainer(): INestApplicationContext {
        return this.container;
    }

    init(argv: string[]): Command {
        this.cli.on('command:*', () => {
            this.cli.help();
        });
        const args = this.cli.parse(argv) as Command;
        if (argv.length === 2) {
            this.cli.help();
        }

        return args;
    }

    subCommands(
        parent: Command,
        command: string,
        description: string
    ): Command {
        const subCommand = parent.command(command).description(description);
        return forwardSubCommands.bind(subCommand)();
    }
}
