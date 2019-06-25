import { Console, Command } from '../decorators';

@Console()
export class ConsoleServiceTest {
    @Command({
        command: 'testCommand <myArgument>',
        description: 'A command to test decorators'
    })
    public myCommand(myArgument: string) {
        process.stdout.write(myArgument);
        process.exit(0);
    }
}
