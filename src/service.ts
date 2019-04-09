import { Injectable } from '@nestjs/common';
import ora from 'ora';
import { Command, forwardSubCommands } from './commander';
import { InjectCommander } from './decorators';

@Injectable()
export class ConsoleService {
    constructor(@InjectCommander() protected readonly cli: Command) {}

    static createSpinner(text?: string) {
        return ora(text);
    }

    getCli() {
        return this.cli;
    }

    init(argv: string[]) {
        this.cli.on('command:*', () => {
            this.cli.help();
        });
        if (argv.length === 2) {
            argv.push('');
        }
        this.cli.parse(argv);
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
