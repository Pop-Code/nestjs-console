/**
 * @module nestjs-console
 */

import { ConsoleModuleTest } from './module';
import { BootstrapConsole } from '../console';
import { NestApplicationContext } from '@nestjs/core';

describe('BootstrapConsole', () => {
    it('Should init the application context', async () => {
        const mockExit = jest.spyOn(process, 'exit').mockImplementation();
        const mockLog = jest
            .spyOn(process.stdout, 'write')
            .mockImplementation();
        const mockErrorLog = jest.spyOn(console, 'error').mockImplementation();

        const bootstrap = await BootstrapConsole.init({
            module: ConsoleModuleTest
        });

        expect(bootstrap).toHaveProperty('app');
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
        mockErrorLog.mockRestore();
    });
});
