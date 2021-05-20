import { Command, Console } from '../../../src/decorators';

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
