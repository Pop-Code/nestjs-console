// tslint:disable:no-console
import { Command, Console } from '../../../decorators';

@Console({
    name: 'groupCommand'
})
export class CliMergedWithNamedDecorator {
    @Command({
        command: 'subCommandMerged <myArgument>'
    })
    subCommandMerged(myArgument: string): string {
        console.log(myArgument);
        return myArgument;
    }
}
