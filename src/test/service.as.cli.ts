import { Console, Command } from '../decorators';

@Console({
    name: 'mycli',
    description: 'A complete cli provided by a service class'
})
export class ConsoleServiceTestAsCli {
    @Command({
        command: 'subcommand <myArgument>',
        description: 'A sub command to test decorators',
        options: [
            {
                flags: '-o, --optional [value]'
            }
        ]
    })
    public myCommand(myArgument: string, options: any) {
        process.stdout.write(myArgument);
        process.stdout.write(options.optional);
        process.exit(0);
    }
}
