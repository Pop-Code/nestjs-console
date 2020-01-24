// tslint:disable:no-console
import { Command, Console } from '../../../decorators';

@Console({
    name: 'groupCommand'
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
