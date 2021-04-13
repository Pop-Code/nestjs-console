import { Command, Console } from '../../../src/decorators';

@Console({
    command: 'groupCommand'
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
