import { INestApplicationContext } from '@nestjs/common';
import { Command } from 'commander';

import { BootstrapConsole } from '../bootstrap/console';
import { ConsoleService } from '../service';
import { ModuleWithDecoratorsTest } from './app/decorator/module';
import { ModuleTest } from './app/module';
import { TestBootstrapConsole } from './bootstrap.spec';

let mockStdout: jest.SpyInstance;
let mockLog: jest.SpyInstance;
let mockError: jest.SpyInstance;

beforeEach(() => {
    mockStdout = jest.spyOn(process.stdout, 'write').mockImplementation();
    mockLog = jest.spyOn(console, 'log').mockImplementation();
    mockError = jest.spyOn(console, 'error').mockImplementation();
});

afterEach(() => {
    mockStdout.mockRestore();
    mockLog.mockRestore();
    mockError.mockRestore();
});

const testCommands = (moduleType: ModuleTest | ModuleWithDecoratorsTest): void => {
    let app: INestApplicationContext;
    let bootstrap: BootstrapConsole;
    let consoleService: ConsoleService;

    beforeEach(async () => {
        bootstrap = new TestBootstrapConsole({
            module: moduleType,
            withContainer: true,
            useDecorators: true
        });
        app = await bootstrap.init();
        await app.init();
        consoleService = app.get<ConsoleService>(ConsoleService);
    });

    afterEach(() => {
        consoleService.resetCli();
    });

    it('should display an error when cli does not contain sub command', async () => {
        consoleService.resetCli();
        expect.assertions(5);
        try {
            await bootstrap.boot([process.argv0, 'console']);
        } catch (e) {
            expect(e.message).toEqual('The cli does not contain sub command');
            expect(mockError).toHaveBeenCalledTimes(1);
            expect(mockError.mock.calls[0][0].trim()).toEqual(e.message);
            expect(mockStdout).not.toHaveBeenCalled();
            expect(mockLog).not.toHaveBeenCalled();
        }
    });

    describe('Command', () => {
        describe('Error', () => {
            it('should throw an error for unknown command', async () => {
                expect.assertions(5);
                try {
                    await bootstrap.boot([process.argv0, 'console', 'unknowcommand']);
                } catch (e) {
                    expect(e.message).toEqual('"unknowcommand" command not found');
                    expect(mockError).toHaveBeenCalledTimes(1);
                    expect(mockError.mock.calls[0][0]).toContain(e.message);
                    expect(mockStdout).not.toHaveBeenCalled();
                    expect(mockLog).not.toHaveBeenCalled();
                }
            });
            it('should throw an error for unknown command with args', async () => {
                expect.assertions(5);
                try {
                    await bootstrap.boot([process.argv0, 'console', 'unknowcommand', 'argument']);
                } catch (e) {
                    expect(e.message).toEqual('"unknowcommand" command not found');
                    expect(mockError).toHaveBeenCalledTimes(1);
                    expect(mockError.mock.calls[0][0].trim()).toEqual(e.message);
                    expect(mockStdout).not.toHaveBeenCalled();
                    expect(mockLog).not.toHaveBeenCalled();
                }
            });
            it('should throw an error for a missing argument', async () => {
                expect.assertions(5);
                try {
                    await bootstrap.boot([process.argv0, 'console', 'command']);
                } catch (e) {
                    expect(e.message).toEqual("error: missing required argument 'myArgument'");
                    expect(mockError).toHaveBeenCalledTimes(1);
                    expect(mockError.mock.calls[0][0].trim()).toEqual(e.message);
                    expect(mockStdout).not.toHaveBeenCalled();
                    expect(mockLog).not.toHaveBeenCalled();
                }
            });

            it('should throw an error in command', async () => {
                expect.assertions(5);
                try {
                    await bootstrap.boot([process.argv0, 'console', 'commandWithError', 'foobar']);
                } catch (e) {
                    expect(e.message).toEqual('foobar');
                    expect(mockError).toHaveBeenCalledTimes(1);
                    expect(mockError.mock.calls[0][0].trim()).toEqual(e.message);
                    expect(mockStdout).not.toHaveBeenCalled();
                    expect(mockLog).not.toHaveBeenCalled();
                }
            });
            it('should throw an error in command using alias', async () => {
                expect.assertions(5);
                try {
                    await bootstrap.boot([process.argv0, 'console', 'cErr', 'foobar']);
                } catch (e) {
                    expect(e.message).toEqual('foobar');
                    expect(mockError).toHaveBeenCalledTimes(1);
                    expect(mockError.mock.calls[0][0].trim()).toEqual(e.message);
                    expect(mockStdout).not.toHaveBeenCalled();
                    expect(mockLog).not.toHaveBeenCalled();
                }
            });
            it('should throw an error in async command', async () => {
                expect.assertions(5);
                try {
                    await bootstrap.boot([process.argv0, 'console', 'asyncCommandWithError', 'foobar']);
                } catch (e) {
                    expect(e.message).toEqual('foobar');
                    expect(mockError).toHaveBeenCalledTimes(1);
                    expect(mockError.mock.calls[0][0].trim()).toEqual(e.message);
                    expect(mockStdout).not.toHaveBeenCalled();
                    expect(mockLog).not.toHaveBeenCalled();
                }
            });
            it('should throw an error in async command using alias', async () => {
                expect.assertions(5);
                try {
                    await bootstrap.boot([process.argv0, 'console', 'acErr', 'foobar']);
                } catch (e) {
                    expect(e.message).toEqual('foobar');
                    expect(mockError).toHaveBeenCalledTimes(1);
                    expect(mockError.mock.calls[0][0].trim()).toEqual(e.message);
                    expect(mockStdout).not.toHaveBeenCalled();
                    expect(mockLog).not.toHaveBeenCalled();
                }
            });
        });
        describe('Help', () => {
            it('should display the help', async () => {
                await bootstrap.boot([process.argv0, 'console', '--help']);
                expect(mockStdout).toHaveBeenCalledTimes(1);
                expect(mockStdout.mock.calls[0][0]).toContain('Usage: console [options] [command]');
                expect(mockError).not.toHaveBeenCalled();
                expect(mockLog).not.toHaveBeenCalled();
            });
            it('should display the help for empty command', async () => {
                await bootstrap.boot([process.argv0, 'console']);
                expect(mockStdout).toHaveBeenCalledTimes(1);
                expect(mockStdout.mock.calls[0][0]).toContain('Usage: console [options] [command]');
                expect(mockError).not.toHaveBeenCalled();
                expect(mockLog).not.toHaveBeenCalled();
            });
            it('should display the help for a single command', async () => {
                await bootstrap.boot([process.argv0, 'console', 'command', '--help']);
                expect(mockStdout).toHaveBeenCalledTimes(1);
                expect(mockStdout.mock.calls[0][0]).toContain('Usage: console command|c [options] <myArgument>');
                expect(mockError).not.toHaveBeenCalled();
                expect(mockLog).not.toHaveBeenCalled();
            });
            it('should display the help of a sub command', async () => {
                await bootstrap.boot([process.argv0, 'console', 'groupCommand', '--help']);
                expect(mockStdout.mock.calls[0][0]).toContain('Usage: console groupCommand|gc [options] [command]');
                expect(mockStdout.mock.calls[0][0]).toContain('subCommand1|sub1 [options] <myArgument>');
                expect(mockStdout.mock.calls[0][0]).toContain('subCommandWithError|subErr <myArgument>');
                expect(mockError).not.toHaveBeenCalled();
                expect(mockLog).not.toHaveBeenCalled();
            });
        });
        describe('Exectution', () => {
            it('should execute a command', async () => {
                const response = await bootstrap.boot([process.argv0, 'console', 'command', 'foobar']);
                expect(response.data).toBe('foobar');
                expect(response.command).toBeInstanceOf(Command);
                expect(mockLog).toHaveBeenCalledTimes(1);
                expect(mockLog.mock.calls[0][0].trim()).toEqual(response.data);
                expect(mockError).not.toHaveBeenCalled();
                expect(mockStdout).not.toHaveBeenCalled();
            });

            it('should execute a command using alias', async () => {
                const response = await bootstrap.boot([process.argv0, 'console', 'c', 'foobar']);
                expect(response.data).toBe('foobar');
                expect(response.command).toBeInstanceOf(Command);
                expect(mockLog).toHaveBeenCalledTimes(1);
                expect(mockLog.mock.calls[0][0].trim()).toEqual(response.data);
                expect(mockError).not.toHaveBeenCalled();
                expect(mockStdout).not.toHaveBeenCalled();
            });

            it('should execute a command without args', async () => {
                const response = await bootstrap.boot([process.argv0, 'console', 'commandWithNoArg']);
                expect(response.data).toBeUndefined();
                expect(response.command).toBeInstanceOf(Command);
                expect(mockLog).toHaveBeenCalledTimes(1);
                expect(mockLog.mock.calls[0][0].trim()).toEqual('commandWithNoArg executed');
                expect(mockError).not.toHaveBeenCalled();
                expect(mockStdout).not.toHaveBeenCalled();
            });

            it('should execute an async command without args', async () => {
                const response = await bootstrap.boot([process.argv0, 'console', 'asyncCommandWithNoArg']);
                expect(response.data).toBeUndefined();
                expect(response.command).toBeInstanceOf(Command);
                expect(mockLog).toHaveBeenCalledTimes(1);
                expect(mockLog.mock.calls[0][0].trim()).toEqual('asyncCommandWithNoArg executed');
                expect(mockError).not.toHaveBeenCalled();
                expect(mockStdout).not.toHaveBeenCalled();
            });

            it('should execute an async command', async () => {
                const response = await bootstrap.boot([process.argv0, 'console', 'asyncCommand', 'foobar']);
                expect(response.data).toBe('foobar');
                expect(response.command).toBeInstanceOf(Command);
                expect(mockLog).toHaveBeenCalledTimes(1);
                expect(mockLog.mock.calls[0][0]).toEqual(response.data);
                expect(mockError).not.toHaveBeenCalled();
                expect(mockStdout).not.toHaveBeenCalled();
            });

            it('should execute an async command using alias', async () => {
                const response = await bootstrap.boot([process.argv0, 'console', 'ac', 'foobar']);
                expect(response.data).toBe('foobar');
                expect(response.command).toBeInstanceOf(Command);
                expect(mockLog).toHaveBeenCalledTimes(1);
                expect(mockLog.mock.calls[0][0]).toEqual(response.data);
                expect(mockError).not.toHaveBeenCalled();
                expect(mockStdout).not.toHaveBeenCalled();
            });
        });
    });
    describe('groupCommand', () => {
        describe('Error', () => {
            it('should throw an error when creating group command from an execution command', () => {
                const subcommand = consoleService.getCli().command('test <myArgument>');

                expect.assertions(2);
                try {
                    consoleService.createGroupCommand(
                        {
                            name: 'subCommand3',
                            description: 'description'
                        },
                        subcommand
                    );
                } catch (e) {
                    expect(e).toBeInstanceOf(Error);
                    expect(e.message).toEqual('Sub commands cannot be applied to command with explicit args');
                }
            });
            it('should throw an error for an unknown sub command', async () => {
                expect.assertions(5);
                try {
                    await bootstrap.boot([process.argv0, 'console', 'groupCommand', 'unknowcommand']);
                } catch (e) {
                    expect(e.message).toEqual('"unknowcommand" command not found');
                    expect(mockError).toHaveBeenCalledTimes(1);
                    expect(mockError.mock.calls[0][0].trim()).toEqual(e.message);
                    expect(mockStdout).not.toHaveBeenCalled();
                    expect(mockLog).not.toHaveBeenCalled();
                }
            });
            it('should throw an error for an unknown sub command with args', async () => {
                expect.assertions(5);
                try {
                    await bootstrap.boot([process.argv0, 'console', 'groupCommand', 'unknowcommand', 'argument']);
                } catch (e) {
                    expect(e.message).toEqual('"unknowcommand" command not found');
                    expect(mockError).toHaveBeenCalledTimes(1);
                    expect(mockError.mock.calls[0][0].trim()).toEqual(e.message);
                    expect(mockStdout).not.toHaveBeenCalled();
                    expect(mockLog).not.toHaveBeenCalled();
                }
            });
            it('should throw an error for a missing argument', async () => {
                expect.assertions(5);
                try {
                    await bootstrap.boot([process.argv0, 'console', 'groupCommand', 'subCommand1']);
                } catch (e) {
                    expect(e.message).toEqual("error: missing required argument 'myArgument'");
                    expect(mockError).toHaveBeenCalledTimes(1);
                    expect(mockError.mock.calls[0][0].trim()).toEqual(e.message);
                    expect(mockStdout).not.toHaveBeenCalled();
                    expect(mockLog).not.toHaveBeenCalled();
                }
            });
            it('should throw an error in sub command', async () => {
                expect.assertions(5);
                try {
                    await bootstrap.boot([process.argv0, 'console', 'groupCommand', 'subCommandWithError', 'foobar2']);
                } catch (e) {
                    expect(e.message).toEqual('foobar2');
                    expect(mockError).toHaveBeenCalledTimes(1);
                    expect(mockError.mock.calls[0][0].trim()).toEqual(e.message);
                    expect(mockStdout).not.toHaveBeenCalled();
                    expect(mockLog).not.toHaveBeenCalled();
                }
            });
            it('should throw an error in async sub command', async () => {
                expect.assertions(5);
                try {
                    await bootstrap.boot([
                        process.argv0,
                        'console',
                        'groupCommand',
                        'asyncSubCommandWithError',
                        'foobar2'
                    ]);
                } catch (e) {
                    expect(e.message).toEqual('foobar2');
                    expect(mockError).toHaveBeenCalledTimes(1);
                    expect(mockError.mock.calls[0][0].trim()).toEqual(e.message);
                    expect(mockStdout).not.toHaveBeenCalled();
                    expect(mockLog).not.toHaveBeenCalled();
                }
            });
            it('should throw an error in sub command using alias', async () => {
                expect.assertions(5);
                try {
                    await bootstrap.boot([process.argv0, 'console', 'groupCommand', 'subErr', 'foobar2']);
                } catch (e) {
                    expect(e.message).toEqual('foobar2');
                    expect(mockError).toHaveBeenCalledTimes(1);
                    expect(mockError.mock.calls[0][0].trim()).toEqual(e.message);
                    expect(mockStdout).not.toHaveBeenCalled();
                    expect(mockLog).not.toHaveBeenCalled();
                }
            });
            it('should throw an error in async sub command using alias', async () => {
                expect.assertions(5);
                try {
                    await bootstrap.boot([process.argv0, 'console', 'groupCommand', 'acSubErr', 'foobar2']);
                } catch (e) {
                    expect(e.message).toEqual('foobar2');
                    expect(mockError).toHaveBeenCalledTimes(1);
                    expect(mockError.mock.calls[0][0].trim()).toEqual(e.message);
                    expect(mockStdout).not.toHaveBeenCalled();
                    expect(mockLog).not.toHaveBeenCalled();
                }
            });
        });
        describe('Help', () => {
            it('should display the help for an empty sub command', async () => {
                await bootstrap.boot([process.argv0, 'console', 'groupCommand']);
                expect(mockStdout).toHaveBeenCalledTimes(1);
                expect(mockStdout.mock.calls[0][0]).toContain('Usage: console groupCommand|gc [options] [command]');
                expect(mockError).not.toHaveBeenCalled();
                expect(mockLog).not.toHaveBeenCalled();
            });

            it('should display the help for an empty alias sub command', async () => {
                await bootstrap.boot([process.argv0, 'console', 'gc']);
                expect(mockStdout).toHaveBeenCalledTimes(1);
                expect(mockStdout.mock.calls[0][0]).toContain('Usage: console groupCommand|gc [options] [command]');
                expect(mockError).not.toHaveBeenCalled();
                expect(mockLog).not.toHaveBeenCalled();
            });

            it('should display the help for a sub command', async () => {
                await bootstrap.boot([process.argv0, 'console', 'groupCommand', '--help']);
                expect(mockStdout).toHaveBeenCalledTimes(1);
                expect(mockStdout.mock.calls[0][0]).toContain('Usage: console groupCommand|gc [options] [command]');
                expect(mockError).not.toHaveBeenCalled();
                expect(mockLog).not.toHaveBeenCalled();
            });

            it('should display the help for an alias sub command', async () => {
                await bootstrap.boot([process.argv0, 'console', 'groupCommand', 'sub1', '-h']);
                expect(mockStdout).toHaveBeenCalledTimes(1);
                expect(mockStdout.mock.calls[0][0]).toContain(
                    'Usage: console groupCommand subCommand1|sub1 [options] <myArgument>'
                );
                expect(mockError).not.toHaveBeenCalled();
                expect(mockLog).not.toHaveBeenCalled();
            });
        });
        describe('Execution', () => {
            it('should execute a sub command', async () => {
                const response = await bootstrap.boot([
                    process.argv0,
                    'console',
                    'groupCommand',
                    'subCommand1',
                    'foobar'
                ]);
                expect(response.data).toEqual('foobar');
                expect(response.command).toBeInstanceOf(Command);
                expect(mockLog).toHaveBeenCalledTimes(1);
                expect(mockLog.mock.calls[0][0].trim()).toEqual(response.data);
                expect(mockError).not.toHaveBeenCalled();
                expect(mockStdout).not.toHaveBeenCalled();
            });
            it('should execute a sub command using alias', async () => {
                const response = await bootstrap.boot([process.argv0, 'console', 'groupCommand', 'sub1', 'foobar']);
                expect(response.data).toEqual('foobar');
                expect(response.command).toBeInstanceOf(Command);
                expect(mockLog).toHaveBeenCalledTimes(1);
                expect(mockLog.mock.calls[0][0].trim()).toEqual(response.data);
                expect(mockError).not.toHaveBeenCalled();
                expect(mockStdout).not.toHaveBeenCalled();
            });
            it('should execute an async sub command', async () => {
                const response = await bootstrap.boot([
                    process.argv0,
                    'console',
                    'groupCommand',
                    'asyncSubCommand1',
                    'foobar'
                ]);
                expect(response.data).toEqual('foobar');
                expect(response.command).toBeInstanceOf(Command);
                expect(mockLog).toHaveBeenCalledTimes(1);
                expect(mockLog.mock.calls[0][0].trim()).toEqual(response.data);
                expect(mockError).not.toHaveBeenCalled();
                expect(mockStdout).not.toHaveBeenCalled();
            });
            it('should execute an async sub command using alias', async () => {
                const response = await bootstrap.boot([process.argv0, 'console', 'groupCommand', 'acSub1', 'foobar']);
                expect(response.data).toEqual('foobar');
                expect(response.command).toBeInstanceOf(Command);
                expect(mockLog).toHaveBeenCalledTimes(1);
                expect(mockLog.mock.calls[0][0].trim()).toEqual(response.data);
                expect(mockError).not.toHaveBeenCalled();
                expect(mockStdout).not.toHaveBeenCalled();
            });
            it('should execute a command merged from external class', async () => {
                const response = await bootstrap.boot([
                    process.argv0,
                    'console',
                    'groupCommand',
                    'subCommandMerged',
                    'foobar'
                ]);
                expect(response.data).toEqual('foobar');
                expect(response.command).toBeInstanceOf(Command);
                expect(mockLog).toHaveBeenCalledTimes(1);
                expect(mockLog.mock.calls[0][0].trim()).toEqual(response.data);
                expect(mockError).not.toHaveBeenCalled();
                expect(mockStdout).not.toHaveBeenCalled();
            });
            it('should execute a sub command without args', async () => {
                const response = await bootstrap.boot([
                    process.argv0,
                    'console',
                    'groupCommand',
                    'subCommandWithNoArg'
                ]);
                expect(response.data).toBeUndefined();
                expect(response.command).toBeInstanceOf(Command);
                expect(mockLog).toHaveBeenCalledTimes(1);
                expect(mockLog.mock.calls[0][0].trim()).toEqual('subCommandWithNoArg executed');
                expect(mockError).not.toHaveBeenCalled();
                expect(mockStdout).not.toHaveBeenCalled();
            });
            it('should execute an async sub command without args', async () => {
                const response = await bootstrap.boot([
                    process.argv0,
                    'console',
                    'groupCommand',
                    'asyncSubCommandWithNoArg'
                ]);
                expect(response.data).toBeUndefined();
                expect(response.command).toBeInstanceOf(Command);
                expect(mockLog).toHaveBeenCalledTimes(1);
                expect(mockLog.mock.calls[0][0].trim()).toEqual('asyncSubCommandWithNoArg executed');
                expect(mockError).not.toHaveBeenCalled();
                expect(mockStdout).not.toHaveBeenCalled();
            });
        });
    });
};

describe('CommandWithService', () => {
    testCommands(ModuleTest);
});

describe('CommandWithDecorators', () => {
    testCommands(ModuleWithDecoratorsTest);
});
