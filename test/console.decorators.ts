import { BootstrapConsole } from '../src/bootstrap/console';
import { ModuleWithDecoratorsTest } from './app/decorator/module';

// run() inits the application, executes the command, prints errors, sets the exit code and closes the application
new BootstrapConsole({
    module: ModuleWithDecoratorsTest,
    useDecorators: true,
    completion: true
}).run();
