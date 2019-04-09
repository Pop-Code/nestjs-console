/**
 * @module nestjs-console
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ConsoleModule } from '../module';
import { ConsoleService } from '../service';
import { commander } from '../commander';

describe('ConsoleService', () => {
    let mod: TestingModule;
    let service: ConsoleService;

    beforeEach(async () => {
        mod = await Test.createTestingModule({
            imports: [ConsoleModule]
        }).compile();
        service = mod.get<ConsoleService>(ConsoleService);
    });

    it('should have a cli defined', () => {
        const cli = service.getCli();
        expect(cli).toBeDefined();
        expect(cli).toBeInstanceOf(commander.Command);
    });

    it('should create an ora spinner', () => {
        const spinner = ConsoleService.createSpinner('hello');
        expect(spinner).toBeDefined();
    });

    it('should call the cli and display the help', () => {
        const cli = service.getCli();

        const mockCommand = jest.fn();
        cli.command('world')
            .description('Test the cli')
            .action(mockCommand);

        // create mock on console.error, because commander will continue if the process.exit is mocked.
        const mockLogError = jest.spyOn(console, 'error').mockImplementation();
        const mockExit = jest.spyOn(process, 'exit').mockImplementation();
        const mockLog = jest
            .spyOn(process.stdout, 'write')
            .mockImplementation();

        service.init([process.argv0, 'console', '--help']);

        expect(mockLog).toHaveBeenCalledTimes(1);
        expect(mockExit).toHaveBeenCalled();

        mockExit.mockRestore();
        mockLog.mockRestore();
        mockLogError.mockRestore();

        cli.removeAllListeners();
    });

    it('should call the cli and forward to subCommands', () => {
        const cli = service.getCli();
        const prog = service.subCommands(cli, 'hello', 'A test cli');

        const mockCommand = jest.fn();

        prog.command('world <value>')
            .description('Test the cli')
            .action(mockCommand);
        service.init([process.argv0, 'console', 'hello', 'world', 'everybody']);
        expect(mockCommand).toHaveBeenCalledTimes(1);

        const mockCommand2 = jest.fn();
        prog.command('justme <value>')
            .description('Test the cli')
            .action(mockCommand2);

        service.init([
            process.argv0,
            'console',
            'hello',
            'justme',
            'everybody'
        ]);
        expect(mockCommand2).toHaveBeenCalledTimes(1);
    });
});
