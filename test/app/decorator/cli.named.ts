import { Command, Console } from '../../../src/decorators';

@Console({
    command: 'groupCommand',
    alias: 'gc'
})
export class CliWithNamedDecorator {
    @Command({
        command: 'subCommand1 <myArgument>',
        alias: 'sub1',
        description: 'description',
        options: [
            {
                flags: '-o, --optional [value]',
                fn: (v): boolean => (v ? true : false)
            }
        ]
    })
    public subCommand1(myArgument: string, options: { optional?: boolean }): string {
        console.log(myArgument);
        if (options.optional) {
            console.log(options.optional);
        }
        return myArgument;
    }

    @Command({
        command: 'asyncSubCommand1 <myArgument>',
        alias: 'acSub1',
        description: 'description'
    })
    async asyncSubCommand1(myArgument: string): Promise<string> {
        // wait 1 second simulating async task
        return new Promise((ok) => {
            setTimeout(() => {
                console.log(myArgument);
                ok(myArgument);
            }, 0);
        });
    }

    @Command({
        command: 'subCommandWithError <myArgument>',
        alias: 'subErr',
        description: 'description'
    })
    subCommandWithError(myArgument: string): string {
        throw new Error(myArgument);
    }

    @Command({
        command: 'asyncSubCommandWithError <myArgument>',
        alias: 'acSubErr',
        description: 'description'
    })
    async asyncSubCommandWithError(myArgument: string): Promise<void> {
        // wait 1 second simulating async task
        await new Promise((ok, fail) =>
            setTimeout(() => {
                fail(new Error(myArgument));
            }, 1000)
        );
    }

    @Command({
        command: 'subCommandWithNoArg',
        alias: 'subNoArg',
        description: 'description'
    })
    subCommandWithNoArg(): void {
        console.log('subCommandWithNoArg executed');
    }

    @Command({
        command: 'asyncSubCommandWithNoArg',
        alias: 'acSubNoArg',
        description: 'description'
    })
    async asyncSubCommandWithNoArg(): Promise<void> {
        // wait 1 second simulating async task
        await new Promise((resolve) =>
            setTimeout(() => {
                resolve(undefined);
            }, 3000)
        );
        console.log('asyncSubCommandWithNoArg executed');
    }
}
