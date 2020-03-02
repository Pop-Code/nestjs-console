// tslint:disable:no-console
import { Command, Console } from '../../../decorators';

@Console({
    name: 'groupCommand2'
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
