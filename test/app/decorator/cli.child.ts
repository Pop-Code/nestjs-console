import commander = require('commander');

import { Command, Console } from '../../../src/decorators';

@Console({
    command: 'groupCommand.subGroup',
    options: [
        {
            flags: '-t,--test [test]',
            required: true
        }
    ]
})
export class CliChild {
    @Command({
        command: 'com [myArgument]',
        options: [
            {
                flags: '-o,--opt [opt]',
                required: true
            }
        ]
    })
    public test(myArgument: string, options: { opt: string }, command: commander.Command): void {
        console.log(myArgument, options, command.parent?.opts());
    }
}
