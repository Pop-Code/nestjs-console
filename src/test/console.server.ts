import { ExpressAdapter } from '@nestjs/platform-express';

import { BootstrapConsoleServer } from '../bootstrap/server';
import { ModuleWithDecoratorsTest } from './app/decorator/module';

// tslint:disable-next-line:no-implicit-dependencies
const bootstrap = new BootstrapConsoleServer({
    module: ModuleWithDecoratorsTest,
    withContainer: true,
    useDecorators: true,
    contextOptions: { logger: false },
    httpAdapter: new ExpressAdapter()
});

bootstrap.init().then(async app => {
    try {
        await app.init();
        await bootstrap.boot();
        process.exit(0);
    } catch (e) {
        process.exit(1);
    }
});
