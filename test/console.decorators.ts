import { BootstrapConsole } from '../src/bootstrap/console.js';
import { ModuleWithDecoratorsTest } from './app/decorator/module.js';

// run() inits the application, executes the command, prints errors, sets the exit code and closes the application
new BootstrapConsole({
    module: ModuleWithDecoratorsTest,
    useDecorators: true,
    completion: true
}).run();
