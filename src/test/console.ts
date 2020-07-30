import { BootstrapConsole } from '../bootstrap/console';
import { ModuleTest } from './app/module';

const bootstrap = new BootstrapConsole({
    module: ModuleTest,
    useDecorators: true
});
bootstrap.init().then(async (app) => {
    try {
        await app.init();
        await bootstrap.boot();
        process.exit(0);
    } catch (e) {
        process.exit(1);
    }
});
