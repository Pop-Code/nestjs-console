import { INestApplicationContext } from '@nestjs/common';
import { BootstrapConsole } from '../bootstrap/console';
import { ConsoleService } from '../service';
import { ModuleWithDecoratorsTest } from './app/decorator/module';
import { ModuleTest } from './app/module';
import { TestBootstrapConsole } from './bootstrap.spec';

let mockExit: jest.SpyInstance;
let mockStdout: jest.SpyInstance;
let mockLog: jest.SpyInstance;
let mockError: jest.SpyInstance;

beforeEach(async () => {
    mockExit = jest.spyOn(process, 'exit').mockImplementation();
    mockStdout = jest.spyOn(process.stdout, 'write').mockImplementation();
    mockLog = jest.spyOn(console, 'log').mockImplementation();
    mockError = jest.spyOn(console, 'error').mockImplementation();
});

afterEach(() => {
    mockExit.mockRestore();
    mockStdout.mockRestore();
    mockLog.mockRestore();
    mockError.mockRestore();
});

function testCommands(moduleType: any) {
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
        consoleService = app.get<ConsoleService>(ConsoleService);
    });

    afterEach(() => {
        consoleService.resetCli();
    });

    it('should display an error when cli does not contain sub command', async () => {
        consoleService.resetCli();
        expect.assertions(3);
        try {
            await bootstrap.boot([process.argv0, 'console']);
        } catch (e) {
            expect(e.message).toEqual('The cli does not contain sub command');
            expect(mockError).toHaveBeenCalled();
            expect(mockError.mock.calls[0][0].trim()).toEqual(e.message);
        }
    });

    describe('Command', () => {
        describe('Error', () => {
            it('should throw an error for unknown command', async () => {
                expect.assertions(3);
                try {
                    await bootstrap.boot([
                        process.argv0,
                        'console',
                        'unknowcommand'
                    ]);
                } catch (e) {
                    expect(e.message).toEqual(
                        '"unknowcommand" command not found'
                    );
                    expect(mockError).toHaveBeenCalled();
                    expect(mockError.mock.calls[0][0]).toContain(e.message);
                }
            });
            it('should throw an error for unknown command with args', async () => {
                expect.assertions(3);
                try {
                    await bootstrap.boot([
                        process.argv0,
                        'console',
                        'unknowcommand',
                        'argument'
                    ]);
                } catch (e) {
                    expect(e.message).toEqual(
                        '"unknowcommand" command not found'
                    );
                    expect(mockError).toHaveBeenCalled();
                    expect(mockError.mock.calls[0][0].trim()).toEqual(
                        e.message
                    );
                }
            });
            it('should throw an error for a missing argument', async () => {
                expect.assertions(3);
                try {
                    await bootstrap.boot([process.argv0, 'console', 'command']);
                } catch (e) {
                    expect(e.message).toEqual(
                        "error: missing required argument 'myArgument'"
                    );
                    expect(mockError).toHaveBeenCalled();
                    expect(mockError.mock.calls[0][0].trim()).toEqual(
                        e.message
                    );
                }
            });

            it('should throw an error in command', async () => {
                expect.assertions(3);
                try {
                    await bootstrap.boot([
                        process.argv0,
                        'console',
                        'commandWithError',
                        'foobar'
                    ]);
                } catch (e) {
                    expect(e.message).toEqual('foobar');
                    expect(mockError).toHaveBeenCalled();
                    expect(mockError.mock.calls[0][0].trim()).toEqual(
                        e.message
                    );
                }
            });
            it('should throw an error in command using alias', async () => {
                expect.assertions(3);
                try {
                    await bootstrap.boot([
                        process.argv0,
                        'console',
                        'cErr',
                        'foobar'
                    ]);
                } catch (e) {
                    expect(e.message).toEqual('foobar');
                    expect(mockError).toHaveBeenCalled();
                    expect(mockError.mock.calls[0][0].trim()).toEqual(
                        e.message
                    );
                }
            });
            it('should throw an error in async command', async () => {
                expect.assertions(3);
                try {
                    await bootstrap.boot([
                        process.argv0,
                        'console',
                        'asyncCommandWithError',
                        'foobar'
                    ]);
                } catch (e) {
                    expect(e.message).toEqual('foobar');
                    expect(mockError).toHaveBeenCalled();
                    expect(mockError.mock.calls[0][0].trim()).toEqual(
                        e.message
                    );
                }
            });
            it('should throw an error in async command using alias', async () => {
                expect.assertions(3);
                try {
                    await bootstrap.boot([
                        process.argv0,
                        'console',
                        'acErr',
                        'foobar'
                    ]);
                } catch (e) {
                    expect(e.message).toEqual('foobar');
                    expect(mockError).toHaveBeenCalled();
                    expect(mockError.mock.calls[0][0].trim()).toEqual(
                        e.message
                    );
                }
            });
        });
        describe('Help', () => {
            it('should display the help', async () => {
                await bootstrap.boot([process.argv0, 'console', '--help']);
                expect(mockStdout).toHaveBeenCalled();
                expect(mockStdout.mock.calls[0][0]).toContain(
                    'Usage: console [options] [command]'
                );
            });
            it('should display the help for empty command', async () => {
                await bootstrap.boot([process.argv0, 'console']);
                expect(mockStdout).toHaveBeenCalled();
                expect(mockStdout.mock.calls[0][0]).toContain(
                    'Usage: console [options] [command]'
                );
            });
            it('should display the help for a single command', async () => {
                await bootstrap.boot([
                    process.argv0,
                    'console',
                    'command',
                    '--help'
                ]);
                expect(mockStdout).toHaveBeenCalled();
                expect(mockStdout.mock.calls[0][0]).toContain(
                    'Usage: console command|c [options] <myArgument>'
                );
            });
            it('should display the help of a sub command', async () => {
                await bootstrap.boot([
                    process.argv0,
                    'console',
                    'subCommand',
                    '--help'
                ]);
                expect(mockStdout.mock.calls[0][0]).toContain(
                    'Usage: console subCommand|sc [options] [command]'
                );
                expect(mockStdout.mock.calls[0][0]).toContain(
                    'subCommand1|sub1 [options] <myArgument>'
                );
                expect(mockStdout.mock.calls[0][0]).toContain(
                    'subCommandWithError|subErr <myArgument>'
                );
            });
        });
        describe('Exectution', () => {
            it('should execute a command', async () => {
                const response = await bootstrap.boot([
                    process.argv0,
                    'console',
                    'command',
                    'foobar'
                ]);
                expect(response).toBe('foobar');
                expect(mockLog).toHaveBeenCalled();
                expect(mockLog.mock.calls[0][0].trim()).toEqual('foobar');
            });

            it('should execute a command using alias', async () => {
                const response = await bootstrap.boot([
                    process.argv0,
                    'console',
                    'c',
                    'foobar'
                ]);
                expect(response).toBe('foobar');
                expect(mockLog).toHaveBeenCalled();
                expect(mockLog.mock.calls[0][0].trim()).toEqual('foobar');
            });

            it('should execute an async command', async () => {
                const response = await bootstrap.boot([
                    process.argv0,
                    'console',
                    'asyncCommand',
                    'foobar'
                ]);
                expect(response).toBe('foobar');
                expect(mockLog).toHaveBeenCalled();
                expect(mockLog.mock.calls[0][0]).toEqual(response);
            });

            it('should execute an async command using alias', async () => {
                const response = await bootstrap.boot([
                    process.argv0,
                    'console',
                    'ac',
                    'foobar'
                ]);
                expect(response).toBe('foobar');
                expect(mockLog).toHaveBeenCalled();
                expect(mockLog.mock.calls[0][0]).toEqual(response);
            });
        });
    });
    describe('SubCommand', () => {
        describe('Error', () => {
            it('should throw an error when creating sub command from an execution command', () => {
                const subcommand = consoleService
                    .getCli()
                    .command('test <myArgument>');

                expect.assertions(2);
                try {
                    consoleService.createSubCommand(
                        {
                            name: 'subCommand3',
                            description: 'description'
                        },
                        subcommand
                    );
                } catch (e) {
                    expect(e).toBeInstanceOf(Error);
                    expect(e.message).toEqual(
                        'Sub commands cannot be applied to command with explicit args'
                    );
                }
            });
            it('should throw an error for an unknown sub command', async () => {
                expect.assertions(3);
                try {
                    await bootstrap.boot([
                        process.argv0,
                        'console',
                        'subCommand',
                        'unknowcommand'
                    ]);
                } catch (e) {
                    expect(e.message).toEqual(
                        '"unknowcommand" command not found'
                    );
                    expect(mockError).toHaveBeenCalled();
                    expect(mockError.mock.calls[0][0].trim()).toEqual(
                        e.message
                    );
                }
            });
            it('should throw an error for an unknown sub command with args', async () => {
                expect.assertions(3);
                try {
                    await bootstrap.boot([
                        process.argv0,
                        'console',
                        'subCommand',
                        'unknowcommand',
                        'argument'
                    ]);
                } catch (e) {
                    expect(e.message).toEqual(
                        '"unknowcommand" command not found'
                    );
                    expect(mockError).toHaveBeenCalled();
                    expect(mockError.mock.calls[0][0].trim()).toEqual(
                        e.message
                    );
                }
            });
            it('should throw an error for a missing argument', async () => {
                expect.assertions(3);
                try {
                    await bootstrap.boot([
                        process.argv0,
                        'console',
                        'subCommand',
                        'subCommand1'
                    ]);
                } catch (e) {
                    expect(e.message).toEqual(
                        "error: missing required argument 'myArgument'"
                    );
                    expect(mockError).toHaveBeenCalled();
                    expect(mockError.mock.calls[0][0].trim()).toEqual(
                        e.message
                    );
                }
            });
            it('should throw an error in sub command', async () => {
                expect.assertions(3);
                try {
                    await bootstrap.boot([
                        process.argv0,
                        'console',
                        'subCommand',
                        'subCommandWithError',
                        'foobar2'
                    ]);
                } catch (e) {
                    expect(e.message).toEqual('foobar2');
                    expect(mockError).toHaveBeenCalled();
                    expect(mockError.mock.calls[0][0].trim()).toEqual(
                        e.message
                    );
                }
            });
            it('should throw an error in async sub command', async () => {
                expect.assertions(3);
                try {
                    await bootstrap.boot([
                        process.argv0,
                        'console',
                        'subCommand',
                        'asyncSubCommandWithError',
                        'foobar2'
                    ]);
                } catch (e) {
                    expect(e.message).toEqual('foobar2');
                    expect(mockError).toHaveBeenCalled();
                    expect(mockError.mock.calls[0][0].trim()).toEqual(
                        e.message
                    );
                }
            });
            it('should throw an error in sub command using alias', async () => {
                expect.assertions(3);
                try {
                    await bootstrap.boot([
                        process.argv0,
                        'console',
                        'subCommand',
                        'subErr',
                        'foobar2'
                    ]);
                } catch (e) {
                    expect(e.message).toEqual('foobar2');
                    expect(mockError).toHaveBeenCalled();
                    expect(mockError.mock.calls[0][0].trim()).toEqual(
                        e.message
                    );
                }
            });
            it('should throw an error in async sub command using alias', async () => {
                expect.assertions(3);
                try {
                    await bootstrap.boot([
                        process.argv0,
                        'console',
                        'subCommand',
                        'acSubErr',
                        'foobar2'
                    ]);
                } catch (e) {
                    expect(e.message).toEqual('foobar2');
                    expect(mockError).toHaveBeenCalled();
                    expect(mockError.mock.calls[0][0].trim()).toEqual(
                        e.message
                    );
                }
            });
        });
        describe('Help', () => {
            it('should display the help for an empty sub command', async () => {
                await bootstrap.boot([process.argv0, 'console', 'subCommand']);
                expect(mockStdout).toHaveBeenCalled();
                expect(mockStdout.mock.calls[0][0]).toContain(
                    'Usage: console subCommand|sc [options] [command]'
                );
            });

            it('should display the help for an empty alias sub command', async () => {
                await bootstrap.boot([process.argv0, 'console', 'sc']);
                expect(mockStdout).toHaveBeenCalled();
                expect(mockStdout.mock.calls[0][0]).toContain(
                    'Usage: console subCommand|sc [options] [command]'
                );
            });

            it('should display the help for a sub command', async () => {
                await bootstrap.boot([
                    process.argv0,
                    'console',
                    'subCommand',
                    '--help'
                ]);
                expect(mockStdout).toHaveBeenCalled();
                expect(mockStdout.mock.calls[0][0]).toContain(
                    'Usage: console subCommand|sc [options] [command]'
                );
            });

            it('should display the help for an alias sub command', async () => {
                await bootstrap.boot([
                    process.argv0,
                    'console',
                    'subCommand',
                    'sub1',
                    '-h'
                ]);
                expect(mockStdout).toHaveBeenCalled();
                expect(mockStdout.mock.calls[0][0]).toContain(
                    'Usage: console subCommand subCommand1|sub1 [options] <myArgument>'
                );
            });
        });
        describe('Execution', () => {
            it('should execute a sub command', async () => {
                const response = await bootstrap.boot([
                    process.argv0,
                    'console',
                    'subCommand',
                    'subCommand1',
                    'foobar'
                ]);
                expect(response).toEqual('foobar');
                expect(mockLog).toHaveBeenCalled();
                expect(mockLog.mock.calls[0][0].trim()).toEqual(response);
            });
            it('should execute a sub command using alias', async () => {
                const response = await bootstrap.boot([
                    process.argv0,
                    'console',
                    'subCommand',
                    'sub1',
                    'foobar'
                ]);
                expect(response).toEqual('foobar');
                expect(mockLog).toHaveBeenCalled();
                expect(mockLog.mock.calls[0][0].trim()).toEqual(response);
            });
            it('should execute an async sub command', async () => {
                const response = await bootstrap.boot([
                    process.argv0,
                    'console',
                    'subCommand',
                    'asyncSubCommand1',
                    'foobar'
                ]);
                expect(response).toEqual('foobar');
                expect(mockLog).toHaveBeenCalled();
                expect(mockLog.mock.calls[0][0].trim()).toEqual(response);
            });
            it('should execute an async sub command using alias', async () => {
                const response = await bootstrap.boot([
                    process.argv0,
                    'console',
                    'subCommand',
                    'acSub1',
                    'foobar'
                ]);
                expect(response).toEqual('foobar');
                expect(mockLog).toHaveBeenCalled();
                expect(mockLog.mock.calls[0][0].trim()).toEqual(response);
            });
            it('should execute a command merged from external class', async () => {
                const response = await bootstrap.boot([
                    process.argv0,
                    'console',
                    'subCommand',
                    'subCommandMerged',
                    'foobar'
                ]);
                expect(response).toEqual('foobar');
                expect(mockLog).toHaveBeenCalled();
                expect(mockLog.mock.calls[0][0].trim()).toEqual(response);
            });
        });
    });
}

describe('CommandWithService', () => {
    testCommands(ModuleTest);
});

describe('CommandWithDecorators', () => {
    testCommands(ModuleWithDecoratorsTest);
});
