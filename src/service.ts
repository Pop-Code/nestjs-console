import { Injectable, Inject } from '@nestjs/common';
import { CommanderStatic, Command } from 'commander';
import ora from 'ora';

export interface PatchedCommander extends Command {
    forwardSubCommand: () => CommanderStatic;
}

@Injectable()
export class ConsoleService {
    private readonly loader = ora();

    constructor(@Inject('Commander') private readonly cli: CommanderStatic) {}

    getCli() {
        return this.cli;
    }

    log(...args: any[]) {
        console.log(...args);
    }

    createSpinner(text?: string): any {
        return ora(text);
    }

    init(argv: string[]) {
        this.cli.on('command:*', () => this.cli.help());
        this.cli.parse(argv);
        if (argv.length === 2) {
            this.cli.help();
        }
    }
}
