import { Command, Console } from '../../../src/decorators.js';

@Console({
    command: 'groupCommand2',
    description: 'description'
})
export class CliWithNamedDecorator2 {
    @Command({
        command: 'subCommand2 <myArgument>'
    })
    public subCommand2(myArgument: string): string {
        console.log(myArgument);
        return myArgument;
    }
}
