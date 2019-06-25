import { Console, Command } from '../decorators';
import { ConsoleServiceTest } from './service';

@Console({
    name: 'MyServiceCli',
    description: 'A complete cli provided by a service class'
})
export class ConsoleServiceTestAsCli extends ConsoleServiceTest {}
