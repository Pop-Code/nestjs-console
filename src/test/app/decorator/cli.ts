// tslint:disable:no-console
import { Console, Command } from '../../../decorators';

@Console()
export class CliWithDecorator {
    @Command({
        command: 'command <myArgument>',
        alias: 'c',
        description: 'description'
    })
    command(myArgument: string) {
        console.log(myArgument);
        return myArgument;
    }

    @Command({
        command: 'asyncCommand <myArgument>',
        alias: 'ac',
        description: 'description'
    })
    async asyncCommand(myArgument: string) {
        // wait 1 second simulating async task
        return new Promise((ok, fail) => {
            setTimeout(() => {
                console.log(myArgument);
                ok(myArgument);
            }, 0);
        });
    }

    @Command({
        command: 'commandWithError <myArgument>',
        alias: 'cErr',
        description: 'description'
    })
    commandWithError(myArgument: string) {
        throw new Error(myArgument);
    }

    @Command({
        command: 'asyncCommandWithError <myArgument>',
        alias: 'acErr',
        description: 'description'
    })
    async asyncCommandWithError(myArgument: string) {
        // wait 1 second simulating async task
        await new Promise((ok, fail) =>
            setTimeout(() => {
                fail(new Error(myArgument));
            }, 1000)
        );
    }
}
