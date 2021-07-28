import { INestApplicationContext, Type } from '@nestjs/common';
import * as commander from 'commander';

import { BootstrapConsole } from '../src/bootstrap/console';
import { ConsoleService } from '../src/service';
import { CliWithDecorator } from './app/decorator/cli';
import { ModuleWithDecoratorsTest } from './app/decorator/module';
import { ModuleTest } from './app/module';
import { ServiceTest } from './app/service';
import { TestBootstrapConsole } from './bootstrap.spec';

const testCommands = (moduleType: Type<ModuleTest | ModuleWithDecoratorsTest>): void => {
    let app: INestApplicationContext;
    let bootstrap: BootstrapConsole;
    let consoleService: ConsoleService;
    let stdoutMock: jest.Mock;
    let stderrMock: jest.Mock;
    let logMock: jest.SpyInstance;
    beforeEach(async () => {
        bootstrap = new TestBootstrapConsole({
            module: moduleType,
            useDecorators: moduleType === ModuleWithDecoratorsTest
        });
        app = await bootstrap.init();
        await app.init();
        consoleService = app.get<ConsoleService>(ConsoleService);
        stdoutMock = jest.fn();
        stderrMock = jest.fn();
        logMock = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
        stdoutMock.mockReset();
        stderrMock.mockReset();
        logMock.mockReset();
        consoleService.resetCli();
    });

    describe('Command', () => {
        describe('Error', () => {
            it('should throw an error for unknown command', async () => {
                expect.assertions(4);
                const cli = consoleService.getRootCli();
                cli.exitOverride().configureOutput({
                    writeOut: stdoutMock,
                    writeErr: stderrMock
                });
                const error = `error: unknown command 'unknowcommand'`;
                try {
                    await bootstrap.boot([process.argv0, 'console', 'unknowcommand']);
                } catch (e) {
                    expect(e).toBeInstanceOf(commander.CommanderError);
                    expect(e.message).toContain(error);
                }
                expect(stderrMock).toHaveBeenCalledWith(`${error}\n`);
                expect(stdoutMock).not.toHaveBeenCalled();
            });
            it('should throw an error for unknown command with args', async () => {
                expect.assertions(4);
                const cli = consoleService.getRootCli();
                cli.exitOverride().configureOutput({
                    writeOut: stdoutMock,
                    writeErr: stderrMock
                });
                const error = `error: unknown command 'unknowcommand'`;
                try {
                    await bootstrap.boot([process.argv0, 'console', 'unknowcommand', 'argument']);
                } catch (e) {
                    expect(e).toBeInstanceOf(commander.CommanderError);
                    expect(e.message).toContain(error);
                }
                expect(stderrMock).toHaveBeenCalledWith(`${error}\n`);
                expect(stdoutMock).not.toHaveBeenCalled();
            });
            it('should throw an error for a missing argument', async () => {
                expect.assertions(5);
                const cli = consoleService.getCli('command');
                expect(cli).toBeInstanceOf(commander.Command);
                cli?.exitOverride().configureOutput({
                    writeOut: stdoutMock,
                    writeErr: stderrMock
                });
                const error = `error: missing required argument 'myArgument'`;
                try {
                    await bootstrap.boot([process.argv0, 'console', 'command']);
                } catch (e) {
                    expect(e).toBeInstanceOf(commander.CommanderError);
                    expect(e.message).toContain(error);
                }
                expect(stderrMock).toHaveBeenCalledWith(`${error}\n`);
                expect(stdoutMock).not.toHaveBeenCalled();
            });

            it('should throw an error in command', async () => {
                expect.assertions(5);
                const cli = consoleService.getCli('commandWithError');
                expect(cli).toBeInstanceOf(commander.Command);
                cli?.exitOverride().configureOutput({
                    writeOut: stdoutMock,
                    writeErr: stderrMock
                });
                const error = `foobar`;
                try {
                    await bootstrap.boot([process.argv0, 'console', 'commandWithError', 'foobar']);
                } catch (e) {
                    expect(e).toBeInstanceOf(Error);
                    expect(e.message).toContain(error);
                }
                expect(stderrMock).not.toHaveBeenCalled();
                expect(stdoutMock).not.toHaveBeenCalled();
            });
            it('should throw an error in command using alias', async () => {
                expect.assertions(5);
                const cli = consoleService.getCli('commandWithError');
                expect(cli).toBeInstanceOf(commander.Command);
                cli?.exitOverride().configureOutput({
                    writeOut: stdoutMock,
                    writeErr: stderrMock
                });
                const error = `foobar`;
                try {
                    await bootstrap.boot([process.argv0, 'console', 'cErr', 'foobar']);
                } catch (e) {
                    expect(e).toBeInstanceOf(Error);
                    expect(e.message).toContain(error);
                }
                expect(stderrMock).not.toHaveBeenCalled();
                expect(stdoutMock).not.toHaveBeenCalled();
            });
            it('should throw an error in async command', async () => {
                expect.assertions(5);
                const cli = consoleService.getCli('asyncCommandWithError');
                expect(cli).toBeInstanceOf(commander.Command);
                cli?.exitOverride().configureOutput({
                    writeOut: stdoutMock,
                    writeErr: stderrMock
                });
                const error = `foobar`;
                try {
                    await bootstrap.boot([process.argv0, 'console', 'asyncCommandWithError', 'foobar']);
                } catch (e) {
                    expect(e).toBeInstanceOf(Error);
                    expect(e.message).toContain(error);
                }
                expect(stderrMock).not.toHaveBeenCalled();
                expect(stdoutMock).not.toHaveBeenCalled();
            });
            it('should throw an error in async command using alias', async () => {
                expect.assertions(5);
                const cli = consoleService.getCli('asyncCommandWithError');
                expect(cli).toBeInstanceOf(commander.Command);
                cli?.exitOverride().configureOutput({
                    writeOut: stdoutMock,
                    writeErr: stderrMock
                });
                const error = `foobar`;
                try {
                    await bootstrap.boot([process.argv0, 'console', 'acErr', 'foobar']);
                } catch (e) {
                    expect(e).toBeInstanceOf(Error);
                    expect(e.message).toContain(error);
                }
                expect(stderrMock).not.toHaveBeenCalled();
                expect(stdoutMock).not.toHaveBeenCalled();
            });
            it('should throw an error in a command with required option', async () => {
                expect.assertions(5);
                const cli = consoleService.getCli('commandWithRequiredOption');
                expect(cli).toBeInstanceOf(commander.Command);
                cli?.exitOverride().configureOutput({
                    writeOut: stdoutMock,
                    writeErr: stderrMock
                });
                const error = `error: required option '-o,--requiredOptions [requiredOptions]' not specified`;
                try {
                    await bootstrap.boot([process.argv0, 'console', 'commandWithRequiredOption']);
                } catch (e) {
                    expect(e).toBeInstanceOf(Error);
                    expect(e.message).toContain(error);
                }
                expect(stderrMock).toHaveBeenCalledWith(`${error}\n`);
                expect(stdoutMock).not.toHaveBeenCalled();
            });
        });
        describe('Help', () => {
            it('should display the help', async () => {
                const cli = consoleService.getRootCli();
                expect(cli).toBeInstanceOf(commander.Command);
                cli?.exitOverride().configureOutput({
                    writeOut: stdoutMock,
                    writeErr: stderrMock
                });
                try {
                    await bootstrap.boot([process.argv0, 'console', '--help']);
                } catch (e) {
                    // ignore
                }
                expect(stdoutMock.mock.calls[0][0]).toContain('Usage: console [options] [command]');
                expect(stderrMock).not.toHaveBeenCalled();
            });
            it('should display the help in stderr for empty command', async () => {
                const cli = consoleService.getRootCli();
                expect(cli).toBeInstanceOf(commander.Command);
                cli?.exitOverride().configureOutput({
                    writeOut: stdoutMock,
                    writeErr: stderrMock
                });
                try {
                    await bootstrap.boot([process.argv0, 'console']);
                } catch (e) {
                    // ignore
                }
                expect(stderrMock.mock.calls[0][0]).toContain('Usage: console [options] [command]');
                expect(stdoutMock).not.toHaveBeenCalled();
            });
            it('should display the help for a single command', async () => {
                const cli = consoleService.getCli('command');
                expect(cli).toBeInstanceOf(commander.Command);
                cli?.exitOverride().configureOutput({
                    writeOut: stdoutMock,
                    writeErr: stderrMock
                });
                try {
                    await bootstrap.boot([process.argv0, 'console', 'command', '--help']);
                } catch (e) {
                    // ignore
                }
                expect(stdoutMock.mock.calls[0][0]).toContain('Usage: console command|c [options] <myArgument>');
                expect(stderrMock).not.toHaveBeenCalled();
            });
            it('should display the help for a sub command', async () => {
                const cli = consoleService.getCli('groupCommand');
                expect(cli).toBeInstanceOf(commander.Command);
                cli?.exitOverride().configureOutput({
                    writeOut: stdoutMock,
                    writeErr: stderrMock
                });
                try {
                    await bootstrap.boot([process.argv0, 'console', 'groupCommand', '--help']);
                } catch (e) {
                    // ignore
                }
                expect(stdoutMock.mock.calls[0][0]).toContain('Usage: console groupCommand|gc [options] [command]');
                expect(stdoutMock.mock.calls[0][0]).toContain('subCommand1|sub1 [options] <myArgument>');
                expect(stdoutMock.mock.calls[0][0]).toContain('subCommandWithError|subErr <myArgument>');
                expect(stderrMock).not.toHaveBeenCalled();
            });
            it('should display the help in stderr for empty sub command', async () => {
                const cli = consoleService.getCli('groupCommand');
                expect(cli).toBeInstanceOf(commander.Command);
                cli?.exitOverride().configureOutput({
                    writeOut: stdoutMock,
                    writeErr: stderrMock
                });
                try {
                    await bootstrap.boot([process.argv0, 'console', 'groupCommand']);
                } catch (e) {
                    // ignore
                }
                expect(stderrMock.mock.calls[0][0]).toContain('Usage: console groupCommand|gc [options] [command]');
                expect(stderrMock.mock.calls[0][0]).toContain('subCommand1|sub1 [options] <myArgument>');
                expect(stderrMock.mock.calls[0][0]).toContain('subCommandWithError|subErr <myArgument>');
                expect(stdoutMock).not.toHaveBeenCalled();
            });
        });
        describe('Execution', () => {
            it('should execute a command', async () => {
                const cli = consoleService.getCli('command');
                expect(cli).toBeInstanceOf(commander.Command);
                cli?.exitOverride().configureOutput({
                    writeOut: stdoutMock,
                    writeErr: stderrMock
                });
                const message = `foobar`;
                const response = await bootstrap.boot([process.argv0, 'console', 'command', message]);
                expect(response.data).toBe(message);
                expect(response.command).toBe(cli);
                expect(logMock).toHaveBeenCalledWith(response.data);
                expect(stdoutMock).not.toHaveBeenCalled();
                expect(stderrMock).not.toHaveBeenCalled();
            });

            it('should execute a command using alias', async () => {
                const cli = consoleService.getCli('command');
                expect(cli).toBeInstanceOf(commander.Command);
                cli?.exitOverride().configureOutput({
                    writeOut: stdoutMock,
                    writeErr: stderrMock
                });
                const message = `foobar`;
                const response = await bootstrap.boot([process.argv0, 'console', 'c', message]);
                expect(response.data).toBe(message);
                expect(response.command).toBe(cli);
                expect(logMock).toHaveBeenCalledWith(response.data);
                expect(stdoutMock).not.toHaveBeenCalled();
                expect(stderrMock).not.toHaveBeenCalled();
            });

            it('should execute a command with multiple args', async () => {
                const cli = consoleService.getCli('command2');
                expect(cli).toBeInstanceOf(commander.Command);
                cli?.exitOverride().configureOutput({
                    writeOut: stdoutMock,
                    writeErr: stderrMock
                });
                const args = ['foo', 'bar'];
                const response = await bootstrap.boot([process.argv0, 'console', 'command2', ...args]);
                expect(response.data).toBe(`${args[0]}::${args[1]}`);
                expect(response.command).toBe(cli);
                expect(logMock).toHaveBeenCalledWith(response.data);
                expect(stdoutMock).not.toHaveBeenCalled();
                expect(stderrMock).not.toHaveBeenCalled();
            });

            it('should execute a command without args', async () => {
                const cli = consoleService.getCli('commandWithNoArg');
                expect(cli).toBeInstanceOf(commander.Command);
                cli?.exitOverride().configureOutput({
                    writeOut: stdoutMock,
                    writeErr: stderrMock
                });
                const response = await bootstrap.boot([process.argv0, 'console', 'commandWithNoArg']);
                expect(response.data).toBeUndefined();
                expect(response.command).toBe(cli);
                expect(logMock).toHaveBeenCalledWith('commandWithNoArg executed');
                expect(stdoutMock).not.toHaveBeenCalled();
                expect(stderrMock).not.toHaveBeenCalled();
            });

            it('should execute an async command without args', async () => {
                const cli = consoleService.getCli('asyncCommandWithNoArg');
                expect(cli).toBeInstanceOf(commander.Command);
                cli?.exitOverride().configureOutput({
                    writeOut: stdoutMock,
                    writeErr: stderrMock
                });
                const response = await bootstrap.boot([process.argv0, 'console', 'asyncCommandWithNoArg']);
                expect(response.data).toBeUndefined();
                expect(response.command).toBe(cli);
                expect(logMock).toHaveBeenCalledWith('asyncCommandWithNoArg executed');
                expect(stdoutMock).not.toHaveBeenCalled();
                expect(stderrMock).not.toHaveBeenCalled();
            });

            it('should execute an async command', async () => {
                const cli = consoleService.getCli('asyncCommand');
                expect(cli).toBeInstanceOf(commander.Command);
                cli?.exitOverride().configureOutput({
                    writeOut: stdoutMock,
                    writeErr: stderrMock
                });
                const message = 'foobar';
                const response = await bootstrap.boot([process.argv0, 'console', 'asyncCommand', message]);
                expect(response.data).toBe(message);
                expect(response.command).toBe(cli);
                expect(logMock).toHaveBeenCalledWith(message);
                expect(stdoutMock).not.toHaveBeenCalled();
                expect(stderrMock).not.toHaveBeenCalled();
            });

            it('should execute an async command using alias', async () => {
                const cli = consoleService.getCli('asyncCommand');
                expect(cli).toBeInstanceOf(commander.Command);
                cli?.exitOverride().configureOutput({
                    writeOut: stdoutMock,
                    writeErr: stderrMock
                });
                const message = 'foobar';
                const response = await bootstrap.boot([process.argv0, 'console', 'ac', message]);
                expect(response.data).toBe(message);
                expect(response.command).toBe(cli);
                expect(logMock).toHaveBeenCalledWith(message);
                expect(stdoutMock).not.toHaveBeenCalled();
                expect(stderrMock).not.toHaveBeenCalled();
            });
            it('should execute a command with optional option', async () => {
                const cli = consoleService.getCli('command');
                expect(cli).toBeInstanceOf(commander.Command);
                cli?.exitOverride().configureOutput({
                    writeOut: stdoutMock,
                    writeErr: stderrMock
                });
                const response = await bootstrap.boot([process.argv0, 'console', 'command', '-o', 'foo', 'bar']);
                expect(response.data).toBe('bar');
                expect(logMock).toHaveBeenCalledWith('bar');
                expect(logMock).toHaveBeenCalledWith('foo');
                expect(stdoutMock).not.toHaveBeenCalled();
                expect(stderrMock).not.toHaveBeenCalled();
            });
            it('should execute a command with required option', async () => {
                const cli = consoleService.getCli('commandWithRequiredOption');
                expect(cli).toBeInstanceOf(commander.Command);
                cli?.exitOverride().configureOutput({
                    writeOut: stdoutMock,
                    writeErr: stderrMock
                });
                const response = await bootstrap.boot([
                    process.argv0,
                    'console',
                    'commandWithRequiredOption',
                    '-o',
                    'foobar'
                ]);
                expect(response.data).toHaveProperty('requiredOptions');
                expect(response.data.requiredOptions).toBe('foobar');
                expect(logMock).toHaveBeenCalledWith({ requiredOptions: 'foobar' });
                expect(stdoutMock).not.toHaveBeenCalled();
                expect(stderrMock).not.toHaveBeenCalled();
            });
        });
        describe('Signature', () => {
            it('should execute a command and check command signature', async () => {
                let service: ServiceTest | CliWithDecorator;
                if (moduleType === ModuleTest) {
                    service = app.get(ServiceTest);
                } else {
                    service = app.get(CliWithDecorator);
                }
                service.command = service.command.bind(service);
                const mockHandler = jest.spyOn(service, 'command').mockImplementation();
                const arg = `foobar`;
                await bootstrap.boot([process.argv0, 'console', 'command', arg]);
                expect(mockHandler).toHaveBeenCalledTimes(1);
                expect(mockHandler.mock.calls[0][0]).toBe(arg);
                expect(typeof mockHandler.mock.calls[0][1]).toBe('object');
                expect(JSON.stringify(mockHandler.mock.calls[0][1])).toBe('{}');
                expect(mockHandler.mock.calls[0][2]).toBeInstanceOf(commander.Command);
                mockHandler.mockReset();

                await bootstrap.boot([process.argv0, 'console', 'command', arg, '-o', 'foo']);
                expect(mockHandler).toHaveBeenCalledTimes(1);
                expect(mockHandler.mock.calls[0][0]).toBe(arg);
                expect(typeof mockHandler.mock.calls[0][1]).toBe('object');
                expect(mockHandler.mock.calls[0][1].optional).toBe('foo');
                expect(mockHandler.mock.calls[0][2]).toBeInstanceOf(commander.Command);
                mockHandler.mockReset();

                mockHandler.mockRestore();
            });
        });
    });
    describe('Command Group', () => {
        describe('Error', () => {
            it('should throw an error when creating group command from an execution command', () => {
                expect.assertions(3);
                const cli = consoleService.getCli('command');
                expect(cli).toBeInstanceOf(commander.Command);
                try {
                    consoleService.createGroupCommand(
                        {
                            command: 'subCommand3',
                            description: 'description'
                        },
                        cli as any
                    );
                } catch (e) {
                    expect(e).toBeInstanceOf(Error);
                    expect(e.message).toEqual('Sub commands cannot be applied to command with explicit args');
                }
            });
            it('should throw an error for an unknown sub command', async () => {
                expect.assertions(4);
                const cli = consoleService.getCli('groupCommand');
                cli?.exitOverride().configureOutput({
                    writeOut: stdoutMock,
                    writeErr: stderrMock
                });
                const error = `error: unknown command 'unknowcommand'`;
                try {
                    await bootstrap.boot([process.argv0, 'console', 'groupCommand', 'unknowcommand']);
                } catch (e) {
                    expect(e).toBeInstanceOf(commander.CommanderError);
                    expect(e.message).toContain(error);
                }
                expect(stderrMock).toHaveBeenCalledWith(`${error}\n`);
                expect(stdoutMock).not.toHaveBeenCalled();
            });
            it('should throw an error for an unknown sub command with args', async () => {
                expect.assertions(4);
                const cli = consoleService.getCli('groupCommand');
                cli?.exitOverride().configureOutput({
                    writeOut: stdoutMock,
                    writeErr: stderrMock
                });
                const error = `error: unknown command 'unknowcommand'`;
                try {
                    await bootstrap.boot([process.argv0, 'console', 'groupCommand', 'unknowcommand', 'argument']);
                } catch (e) {
                    expect(e).toBeInstanceOf(commander.CommanderError);
                    expect(e.message).toContain(error);
                }
                expect(stderrMock).toHaveBeenCalledWith(`${error}\n`);
                expect(stdoutMock).not.toHaveBeenCalled();
            });
            it('should throw an error for a missing argument', async () => {
                expect.assertions(5);
                const cli = consoleService.getCli('groupCommand.subCommand1');
                expect(cli).toBeInstanceOf(commander.Command);
                cli?.exitOverride().configureOutput({
                    writeOut: stdoutMock,
                    writeErr: stderrMock
                });
                const error = `error: missing required argument 'myArgument'`;
                try {
                    await bootstrap.boot([process.argv0, 'console', 'groupCommand', 'subCommand1']);
                } catch (e) {
                    expect(e).toBeInstanceOf(commander.CommanderError);
                    expect(e.message).toContain(error);
                }
                expect(stderrMock).toHaveBeenCalledWith(`${error}\n`);
                expect(stdoutMock).not.toHaveBeenCalled();
            });
            it('should throw an error in sub command', async () => {
                expect.assertions(5);
                const cli = consoleService.getCli('groupCommand.subCommandWithError');
                expect(cli).toBeInstanceOf(commander.Command);
                cli?.exitOverride().configureOutput({
                    writeOut: stdoutMock,
                    writeErr: stderrMock
                });
                const message = 'foobar2';
                try {
                    await bootstrap.boot([process.argv0, 'console', 'groupCommand', 'subCommandWithError', message]);
                } catch (e) {
                    expect(e).toBeInstanceOf(Error);
                    expect(e.message).toContain(message);
                }
                expect(stderrMock).not.toHaveBeenCalled();
                expect(stdoutMock).not.toHaveBeenCalled();
            });
            it('should throw an error in async sub command', async () => {
                expect.assertions(5);
                const cli = consoleService.getCli('groupCommand.asyncSubCommandWithError');
                expect(cli).toBeInstanceOf(commander.Command);
                cli?.exitOverride().configureOutput({
                    writeOut: stdoutMock,
                    writeErr: stderrMock
                });
                const message = 'foobar2';
                try {
                    await bootstrap.boot([
                        process.argv0,
                        'console',
                        'groupCommand',
                        'asyncSubCommandWithError',
                        message
                    ]);
                } catch (e) {
                    expect(e).toBeInstanceOf(Error);
                    expect(e.message).toContain(message);
                }
                expect(stderrMock).not.toHaveBeenCalled();
                expect(stdoutMock).not.toHaveBeenCalled();
            });
            it('should throw an error in sub command using alias', async () => {
                expect.assertions(5);
                const cli = consoleService.getCli('groupCommand.subCommandWithError');
                expect(cli).toBeInstanceOf(commander.Command);
                cli?.exitOverride().configureOutput({
                    writeOut: stdoutMock,
                    writeErr: stderrMock
                });
                const message = 'foobar2';
                try {
                    await bootstrap.boot([process.argv0, 'console', 'groupCommand', 'subErr', message]);
                } catch (e) {
                    expect(e).toBeInstanceOf(Error);
                    expect(e.message).toContain(message);
                }
                expect(stderrMock).not.toHaveBeenCalled();
                expect(stdoutMock).not.toHaveBeenCalled();
            });
            it('should throw an error in async sub command using alias', async () => {
                expect.assertions(5);
                const cli = consoleService.getCli('groupCommand.asyncSubCommandWithError');
                expect(cli).toBeInstanceOf(commander.Command);
                cli?.exitOverride().configureOutput({
                    writeOut: stdoutMock,
                    writeErr: stderrMock
                });
                const message = 'foobar2';
                try {
                    await bootstrap.boot([process.argv0, 'console', 'groupCommand', 'acSubErr', message]);
                } catch (e) {
                    expect(e).toBeInstanceOf(Error);
                    expect(e.message).toContain(message);
                }
                expect(stderrMock).not.toHaveBeenCalled();
                expect(stdoutMock).not.toHaveBeenCalled();
            });
        });
        describe('Help', () => {
            it('should display the help for an empty sub command', async () => {
                const cli = consoleService.getCli('groupCommand');
                expect(cli).toBeInstanceOf(commander.Command);
                cli?.exitOverride().configureOutput({
                    writeOut: stdoutMock,
                    writeErr: stderrMock
                });
                try {
                    await bootstrap.boot([process.argv0, 'console', 'groupCommand']);
                } catch (e) {
                    // ignore
                }
                expect(stderrMock.mock.calls[0][0]).toContain('Usage: console groupCommand|gc [options] [command]');
                expect(stdoutMock).not.toHaveBeenCalled();
            });

            it('should display the help for an empty alias sub command', async () => {
                const cli = consoleService.getCli('groupCommand');
                expect(cli).toBeInstanceOf(commander.Command);
                cli?.exitOverride().configureOutput({
                    writeOut: stdoutMock,
                    writeErr: stderrMock
                });
                try {
                    await bootstrap.boot([process.argv0, 'console', 'gc']);
                } catch (e) {
                    // ignore
                }
                expect(stderrMock.mock.calls[0][0]).toContain('Usage: console groupCommand|gc [options] [command]');
                expect(stdoutMock).not.toHaveBeenCalled();
            });

            it('should display the help for a sub command', async () => {
                const cli = consoleService.getCli('groupCommand');
                expect(cli).toBeInstanceOf(commander.Command);
                cli?.exitOverride().configureOutput({
                    writeOut: stdoutMock,
                    writeErr: stderrMock
                });
                try {
                    await bootstrap.boot([process.argv0, 'console', 'groupCommand', '--help']);
                } catch (e) {
                    // ignore
                }
                expect(stdoutMock.mock.calls[0][0]).toContain('Usage: console groupCommand|gc [options] [command]');
                expect(stderrMock).not.toHaveBeenCalled();
            });

            it('should display the help for an alias sub command', async () => {
                const cli = consoleService.getCli('groupCommand.subCommand1');
                expect(cli).toBeInstanceOf(commander.Command);
                cli?.exitOverride().configureOutput({
                    writeOut: stdoutMock,
                    writeErr: stderrMock
                });
                try {
                    await bootstrap.boot([process.argv0, 'console', 'groupCommand', 'sub1', '--help']);
                } catch (e) {
                    // ignore
                }
                expect(stdoutMock.mock.calls[0][0]).toContain(
                    'Usage: console groupCommand subCommand1|sub1 [options] <myArgument>'
                );
                expect(stderrMock).not.toHaveBeenCalled();
            });
        });
        describe('Execution', () => {
            it('should execute a sub command', async () => {
                const cli = consoleService.getCli('groupCommand.subCommand1');
                expect(cli).toBeInstanceOf(commander.Command);
                cli?.exitOverride().configureOutput({
                    writeOut: stdoutMock,
                    writeErr: stderrMock
                });
                const message = `foobar`;
                const response = await bootstrap.boot([
                    process.argv0,
                    'console',
                    'groupCommand',
                    'subCommand1',
                    message
                ]);
                expect(response.data).toBe(message);
                expect(response.command).toBe(cli);
                expect(logMock).toHaveBeenCalledWith(response.data);
                expect(stdoutMock).not.toHaveBeenCalled();
                expect(stderrMock).not.toHaveBeenCalled();
            });
            it('should execute a sub command using alias', async () => {
                const cli = consoleService.getCli('groupCommand.subCommand1');
                expect(cli).toBeInstanceOf(commander.Command);
                cli?.exitOverride().configureOutput({
                    writeOut: stdoutMock,
                    writeErr: stderrMock
                });
                const message = `foobar`;
                const response = await bootstrap.boot([process.argv0, 'console', 'groupCommand', 'sub1', message]);
                expect(response.data).toBe(message);
                expect(response.command).toBe(cli);
                expect(logMock).toHaveBeenCalledWith(response.data);
                expect(stdoutMock).not.toHaveBeenCalled();
                expect(stderrMock).not.toHaveBeenCalled();
            });
            it('should execute an async sub command', async () => {
                const cli = consoleService.getCli('groupCommand.asyncSubCommand1');
                expect(cli).toBeInstanceOf(commander.Command);
                cli?.exitOverride().configureOutput({
                    writeOut: stdoutMock,
                    writeErr: stderrMock
                });
                const message = `foobar`;
                const response = await bootstrap.boot([
                    process.argv0,
                    'console',
                    'groupCommand',
                    'asyncSubCommand1',
                    message
                ]);
                expect(response.data).toBe(message);
                expect(response.command).toBe(cli);
                expect(logMock).toHaveBeenCalledWith(response.data);
                expect(stdoutMock).not.toHaveBeenCalled();
                expect(stderrMock).not.toHaveBeenCalled();
            });
            it('should execute an async sub command using alias', async () => {
                const cli = consoleService.getCli('groupCommand.asyncSubCommand1');
                expect(cli).toBeInstanceOf(commander.Command);
                cli?.exitOverride().configureOutput({
                    writeOut: stdoutMock,
                    writeErr: stderrMock
                });
                const message = `foobar`;
                const response = await bootstrap.boot([process.argv0, 'console', 'groupCommand', 'acSub1', message]);
                expect(response.data).toBe(message);
                expect(response.command).toBe(cli);
                expect(logMock).toHaveBeenCalledWith(response.data);
                expect(stdoutMock).not.toHaveBeenCalled();
                expect(stderrMock).not.toHaveBeenCalled();
            });
            it('should execute a command merged from external class', async () => {
                const cli = consoleService.getCli('groupCommand.subCommandMerged');
                expect(cli).toBeInstanceOf(commander.Command);
                cli?.exitOverride().configureOutput({
                    writeOut: stdoutMock,
                    writeErr: stderrMock
                });
                const message = 'message';
                const response = await bootstrap.boot([
                    process.argv0,
                    'console',
                    'groupCommand',
                    'subCommandMerged',
                    message
                ]);
                expect(response.data).toBe(message);
                expect(response.command).toBe(cli);
                expect(logMock).toHaveBeenCalledWith(response.data);
                expect(stdoutMock).not.toHaveBeenCalled();
                expect(stderrMock).not.toHaveBeenCalled();
            });
            it('should execute a sub command without args', async () => {
                const cli = consoleService.getCli('groupCommand.subCommandWithNoArg');
                expect(cli).toBeInstanceOf(commander.Command);
                cli?.exitOverride().configureOutput({
                    writeOut: stdoutMock,
                    writeErr: stderrMock
                });
                const response = await bootstrap.boot([
                    process.argv0,
                    'console',
                    'groupCommand',
                    'subCommandWithNoArg'
                ]);
                expect(response.data).toBeUndefined();
                expect(response.command).toBe(cli);
                expect(logMock).toHaveBeenCalledWith('subCommandWithNoArg executed');
                expect(stdoutMock).not.toHaveBeenCalled();
                expect(stderrMock).not.toHaveBeenCalled();
            });
            it('should execute an async sub command without args', async () => {
                const cli = consoleService.getCli('groupCommand.asyncSubCommandWithNoArg');
                expect(cli).toBeInstanceOf(commander.Command);
                cli?.exitOverride().configureOutput({
                    writeOut: stdoutMock,
                    writeErr: stderrMock
                });
                const response = await bootstrap.boot([
                    process.argv0,
                    'console',
                    'groupCommand',
                    'asyncSubCommandWithNoArg'
                ]);
                expect(response.data).toBeUndefined();
                expect(response.command).toBe(cli);
                expect(logMock).toHaveBeenCalledWith('asyncSubCommandWithNoArg executed');
                expect(stdoutMock).not.toHaveBeenCalled();
                expect(stderrMock).not.toHaveBeenCalled();
            });
            it('should execute a sub command with global options', async () => {
                const cli = consoleService.getCli('groupCommandWithOptions.commandWithGlobalOptions');
                expect(cli).toBeInstanceOf(commander.Command);
                cli?.exitOverride().configureOutput({
                    writeOut: stdoutMock,
                    writeErr: stderrMock
                });
                const message = `foobar`;
                const response = await bootstrap.boot([
                    process.argv0,
                    'console',
                    'groupCommandWithOptions',
                    'commandWithGlobalOptions',
                    '-g',
                    '-o',
                    'myoptions',
                    message
                ]);
                expect(response.data).toBe(message);
                expect(response.command).toBe(cli);
                expect(logMock).toHaveBeenCalledTimes(3);
                expect(logMock).toHaveBeenNthCalledWith(1, response.data);
                expect(logMock).toHaveBeenNthCalledWith(2, 'myoptions');
                expect(logMock).toHaveBeenNthCalledWith(3, true);
                expect(stdoutMock).not.toHaveBeenCalled();
                expect(stderrMock).not.toHaveBeenCalled();
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
