// tslint:disable:no-console
import { Console, Command } from '../../../decorators';

@Console({
    name: 'subCommand2'
})
export class CliWithNamedDecorator2 {
    @Command({
        command: 'subCommand2 <myArgument>'
    })
    public subCommand2(myArgument: string) {
        console.log(myArgument);
        process.exit(0);
    }
}
