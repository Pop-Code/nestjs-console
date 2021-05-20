import commander = require('commander');

import { Command, Console } from '../../../src/decorators';

@Console({
    command: 'groupCommandWithOptions',
    options: [{ flags: '-g,--global' }]
})
export class CliWithGlobalOptionDecorator {
    @Command({
        command: 'commandWithGlobalOptions <myArgument>',
        options: [{ flags: '-o, --optional [value]' }]
    })
    public command(myArgument: string, options: { optional?: boolean }, command: commander.Command): string {
        console.log(myArgument);
        if (options.optional !== undefined) {
            console.log(options.optional);
        }
        const parentOptions = command.parent?.opts();
        if (parentOptions?.global) {
            console.log(parentOptions.global);
        }
        return myArgument;
    }
}
