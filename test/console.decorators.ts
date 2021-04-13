import { BootstrapConsole } from '../src/bootstrap/console';
import { ModuleWithDecoratorsTest } from './app/decorator/module';

const bootstrap = new BootstrapConsole({
    module: ModuleWithDecoratorsTest,
    useDecorators: true
});
bootstrap.init().then(async (app) => {
    try {
        await app.init();
        await bootstrap.boot();
        await app.close();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
});
