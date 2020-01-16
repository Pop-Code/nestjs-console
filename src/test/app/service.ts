// tslint:disable: no-console
import { Injectable } from '@nestjs/common';
import { ConsoleService } from '../../service';

@Injectable()
export class ServiceTest {
    constructor(private readonly consoleService: ConsoleService) {
        this.bindCommands();
    }

    protected bindCommands() {
        // get the cli
        const cli = this.consoleService.getCli();

        this.consoleService.createCommand(
            {
                command: 'command <myArgument>',
                description: 'description',
                alias: 'c',
                options: [{ flags: '-o, --optional [value]' }]
            },
            this.command,
            cli
        );

        this.consoleService.createCommand(
            {
                command: 'asyncCommand <myArgument>',
                description: 'description',
                alias: 'ac'
            },
            this.asyncCommand,
            cli
        );

        this.consoleService.createCommand(
            {
                command: 'commandWithError <myArgument>',
                description: 'description',
                alias: 'cErr'
            },
            this.commandWithError,
            cli
        );

        this.consoleService.createCommand(
            {
                command: 'asyncCommandWithError <myArgument>',
                description: 'description',
                alias: 'acErr'
            },
            this.asyncCommandWithError,
            cli
        );

        const subCommand = this.consoleService.createGroupCommand(
            {
                name: 'subCommand',
                alias: 'sc',
                description: 'description'
            },
            cli
        );

        this.consoleService.createCommand(
            {
                command: 'subCommand1 <myArgument>',
                alias: 'sub1',
                description: 'description',
                options: [{ flags: '-o, --optional [value]' }]
            },
            this.command,
            subCommand
        );

        this.consoleService.createCommand(
            {
                command: 'asyncSubCommand1 <myArgument>',
                alias: 'acSub1',
                description: 'description'
            },
            this.asyncCommand,
            subCommand
        );

        this.consoleService.createCommand(
            {
                command: 'subCommandWithError <myArgument>',
                alias: 'subErr',
                description: 'description'
            },
            this.commandWithError,
            subCommand
        );

        this.consoleService.createCommand(
            {
                command: 'asyncSubCommandWithError <myArgument>',
                alias: 'acSubErr',
                description: 'description'
            },
            this.asyncCommandWithError,
            subCommand
        );

        this.consoleService.createCommand(
            {
                command: 'subCommandMerged <myArgument>'
            },
            this.command,
            subCommand
        );
    }

    command = (myArgument: string, options: any) => {
        console.log(myArgument);
        if (options.optional) {
            console.log(options.optional);
        }
        return myArgument;
    }

    commandWithError = (myArgument: string) => {
        throw new Error(myArgument);
    }

    asyncCommand = async (myArgument: string) => {
        // wait 1 second simulating async task
        return new Promise((ok, fail) =>
            setTimeout(() => {
                console.log(myArgument);
                ok(myArgument);
            }, 1000)
        );
    }

    asyncCommandWithError = async (myArgument: string) => {
        // wait 1 second simulating async task
        await new Promise((ok, fail) =>
            setTimeout(() => {
                fail(new Error(myArgument));
            }, 1000)
        );
    }
}
