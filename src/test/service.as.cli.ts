import { Console, Command } from '../decorators';
import { ConsoleServiceTest } from './service';

@Console({
    name: 'mycli',
    description: 'A complete cli provided by a service class'
})
export class ConsoleServiceTestAsCli {
    @Command({
        command: 'subcommand <myArgument>',
        description: 'A sub command to test decorators'
    })
    public myCommand(myArgument: string) {
        process.stdout.write(myArgument);
        process.exit(0);
    }
}
