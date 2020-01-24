import { NestApplicationContext } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';

import { AbstractBootstrapConsole } from '../bootstrap/abstract';
import { BootstrapConsole, BootstrapConsoleOptions } from '../bootstrap/console';
import { ModuleTest } from './app/module';

export class TestBootstrapConsole extends AbstractBootstrapConsole<TestingModule, BootstrapConsoleOptions> {
    create(): Promise<TestingModule> {
        return Test.createTestingModule({
            imports: [this.options.module]
        }).compile();
    }
}

describe('BootstrapConsole', () => {
    it('Should init the application context', async () => {
        const bootstrap = new TestBootstrapConsole({
            module: ModuleTest
        });
        const app = await bootstrap.init();
        expect(app).toBeInstanceOf(NestApplicationContext);
        const options = bootstrap.getOptions();
        expect(options.contextOptions.logger).toHaveLength(1);
        expect(options.contextOptions.logger[0]).toBe('error');
    });

    it('Should init the application context with container', async () => {
        const bootstrap = new BootstrapConsole({
            module: ModuleTest,
            withContainer: true
        });
        const app = await bootstrap.init();
        expect(app).toBeInstanceOf(NestApplicationContext);

        // get the service and check the container
        const service = bootstrap.getService();
        expect(service.getContainer()).toBe(app);
    });

    it('Should init the application context with an logger level', async () => {
        const bootstrap = new BootstrapConsole({
            module: ModuleTest,
            withContainer: true,
            contextOptions: {
                logger: ['error', 'warn']
            }
        });
        const app = await bootstrap.init();
        expect(app).toBeInstanceOf(NestApplicationContext);

        // get the service and check the container
        const service = bootstrap.getService();
        expect(service.getContainer()).toBe(app);

        const options = bootstrap.getOptions();
        expect(options.contextOptions.logger).toHaveLength(2);
        expect(options.contextOptions.logger[0]).toBe('error');
        expect(options.contextOptions.logger[1]).toBe('warn');
    });
});
