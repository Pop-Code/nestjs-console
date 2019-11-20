import { BootstrapConsole } from '../bootstrap/console';
import { ModuleWithDecoratorsTest } from './app/decorator/module';

const bootrap = new BootstrapConsole({
    module: ModuleWithDecoratorsTest,
    withContainer: true,
    useDecorators: true
});
bootrap.init().then(async app => {
    try {
        await bootrap.boot();
        process.exit(0);
    } catch (e) {
        process.exit(1);
    }
});
