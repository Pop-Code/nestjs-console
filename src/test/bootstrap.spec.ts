import { ModuleTest } from './app/module';
import {
    BootstrapConsole,
    BootstrapConsoleOptions
} from '../bootstrap/console';
import { NestApplicationContext } from '@nestjs/core';
import { TestingModule, Test } from '@nestjs/testing';
import { AbstractBootstrapConsole } from '../bootstrap/abstract';

export class TestBootstrapConsole extends AbstractBootstrapConsole<
    TestingModule,
    BootstrapConsoleOptions
> {
    create() {
        return Test.createTestingModule({
            imports: [this.options.module]
        }).compile();
    }
}

describe('BootstrapConsole', () => {
    beforeAll(() => {});
    it('Should init the application context', async () => {
        const bootstrap = new TestBootstrapConsole({
            module: ModuleTest
        });
        const app = await bootstrap.init();
        expect(app).toBeInstanceOf(NestApplicationContext);
    });

    it('Should init the application context with container', async () => {
        const bootstrap = new BootstrapConsole({
            module: ModuleTest,
            withContainer: true,
            contextOptions: {
                logger: false
            }
        });
        const app = await bootstrap.init();
        expect(app).toBeInstanceOf(NestApplicationContext);

        // get the service and check the container
        const service = bootstrap.getService();
        expect(service.getContainer()).toBe(app);
    });
});
