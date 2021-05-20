import { BootstrapConsole } from '../src/bootstrap/console';
import { ModuleTest } from './app/module';

const bootstrap = new BootstrapConsole({
    module: ModuleTest
});
bootstrap.init().then(async (app) => {
    try {
        await app.init();
        await bootstrap.boot();
        await app.close();
    } catch (e) {
        console.error(e);
        await app.close();
        process.exit(1);
    }
});
