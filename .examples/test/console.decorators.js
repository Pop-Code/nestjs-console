import { BootstrapConsole } from '../src/bootstrap/console.js';
import { ModuleWithDecoratorsTest } from './app/decorator/module.js';
new BootstrapConsole({
    module: ModuleWithDecoratorsTest,
    useDecorators: true,
    completion: true
}).run();
