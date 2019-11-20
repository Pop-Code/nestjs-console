// tslint:disable:no-console
import { Console, Command } from '../../../decorators';

@Console({
    name: 'subCommand'
})
export class CliMergedWithNamedDecorator {
    @Command({
        command: 'subCommandMerged <myArgument>'
    })
    subCommandMerged(myArgument: string, options: any) {
        console.log(myArgument);
        if (options.optional) {
            console.log(options.optional);
        }
        return myArgument;
    }
}
