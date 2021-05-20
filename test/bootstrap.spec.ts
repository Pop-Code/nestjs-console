import { NestApplicationContext } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';

import { AbstractBootstrapConsole } from '../src/bootstrap/abstract';
import { BootstrapConsole } from '../src/bootstrap/console';
import { ModuleTest } from './app/module';

export class TestBootstrapConsole extends AbstractBootstrapConsole<TestingModule> {
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
        expect(options.contextOptions?.logger).toHaveLength(1);
        expect(options.contextOptions?.logger).toContain('error');
    });

    it('Should init the application context with container', async () => {
        const bootstrap = new BootstrapConsole({
            module: ModuleTest
        });
        const app = await bootstrap.init();
        expect(app).toBeInstanceOf(NestApplicationContext);

        // get the service and check the container
        const service = bootstrap.getService();
        expect(service.getContainer()).toBe(app);
    });

    it('Should init the application context with a logger level', async () => {
        const bootstrap = new BootstrapConsole({
            module: ModuleTest,
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
        expect(options.contextOptions?.logger).toHaveLength(2);
        expect(options.contextOptions?.logger).toContain('error');
        expect(options.contextOptions?.logger).toContain('warn');
    });

    it('Should boot the cli with process argv', async () => {
        const bootstrap = new TestBootstrapConsole({
            module: ModuleTest
        });

        await bootstrap.init();
        // get the service and check the container
        const service = bootstrap.getService();
        const mockServiceBoot = jest.spyOn(service, 'init').mockImplementation();

        await bootstrap.boot();
        expect(mockServiceBoot).toHaveBeenCalledWith(process.argv);
    });
});
