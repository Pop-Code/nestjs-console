import { BootstrapConsole } from '../src/bootstrap/console.js';
import { ModuleTest } from './app/module.js';
const bootstrap = new BootstrapConsole({
    module: ModuleTest
});
bootstrap.init().then(async (app) => {
    try {
        await app.init();
        await bootstrap.boot();
        await app.close();
    }
    catch (e) {
        console.error(e);
        await app.close();
        process.exit(1);
    }
});
