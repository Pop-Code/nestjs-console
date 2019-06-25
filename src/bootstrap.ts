import { ConsoleService } from './service';
import { NestFactory } from '@nestjs/core';
import { NestApplicationContextOptions } from '@nestjs/common/interfaces/nest-application-context-options.interface';
import { ConsoleModule } from './module';

export interface BootstrapConsoleOptions {
    module: any;
    contextOptions?: NestApplicationContextOptions;
    service?: { new (...args: any[]): ConsoleService };
    withContainer?: boolean;
}

export class BootstrapConsole {
    static async init(options: BootstrapConsoleOptions) {
        // parse the config
        const config = {
            contextOptions: { logger: false },
            service: ConsoleService,
            ...options
        };

        // create the app context
        const app = await this.createAppContext(config);
        const service = app.get(ConsoleService);

        // inject the container inside the service if requested
        if (config.withContainer) {
            service.setContainer(app);
        }

        const appModule = app.get(ConsoleModule);
        appModule.scan(app, options.module);

        // create a boot function to be use after init
        return {
            app,
            boot(argv?: string[]) {
                return service.init(!argv ? process.argv : argv);
            }
        };
    }

    static createAppContext(options: BootstrapConsoleOptions) {
        return NestFactory.createApplicationContext(
            options.module,
            options.contextOptions
        );
    }
}
