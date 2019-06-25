import { ConsoleModuleTest } from './module';
import { BootstrapConsole } from '../bootstrap';
import { NestApplicationContext } from '@nestjs/core';
import { ConsoleService } from '../service';

describe('BootstrapConsole', () => {
    it('Should init the application context', async () => {
        const mockExit = jest.spyOn(process, 'exit').mockImplementation();
        const mockLog = jest
            .spyOn(process.stdout, 'write')
            .mockImplementation();
        const mockLogError = jest.spyOn(console, 'error').mockImplementation();

        const bootstrap = await BootstrapConsole.init({
            module: ConsoleModuleTest
        });

        expect(bootstrap).toHaveProperty('app');
        expect(bootstrap.app).toBeInstanceOf(NestApplicationContext);
        expect(bootstrap).toHaveProperty('boot');

        bootstrap.boot([process.argv0, 'console']);

        // should habe called 2 times cause exit is mocked.
        expect(mockLog).toHaveBeenCalledTimes(2);
        expect(mockExit).toHaveBeenCalledTimes(2);
        expect(mockLog.mock.calls[0][0]).toContain('Usage:');
        mockLog.mockRestore();
        mockExit.mockRestore();
        mockLogError.mockRestore();
    });

    it('Should init the application context with container', async () => {
        const bootstrap = await BootstrapConsole.init({
            module: ConsoleModuleTest,
            withContainer: true
        });

        expect(bootstrap).toHaveProperty('app');
        expect(bootstrap.app).toBeInstanceOf(NestApplicationContext);
        expect(bootstrap).toHaveProperty('boot');

        // get the service
        const service = bootstrap.app.get(ConsoleService);
        expect(service).toBeInstanceOf(ConsoleService);
        expect(service).toHaveProperty('getContainer');
        expect(service.getContainer()).toBe(bootstrap.app);
    });
});
