import { BootstrapConsole } from '../bootstrap/console';
import { ModuleWithDecoratorsTest } from './app/decorator/module';

const bootstrap = new BootstrapConsole({
    module: ModuleWithDecoratorsTest,
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
