import { BootstrapConsole } from '../bootstrap';
import { ConsoleModuleTestWithDecorators } from './module.decorators';

let app;

beforeAll(async () => {
    app = await BootstrapConsole.init({
        module: ConsoleModuleTestWithDecorators
    });
});

it('Should have an auto registered commands using decorators', async () => {
    const mockExit = jest.spyOn(process, 'exit').mockImplementation();
    const mockLog = jest.spyOn(process.stdout, 'write').mockImplementation();
    const mockLogError = jest.spyOn(console, 'error').mockImplementation();

    app.boot([process.argv0, 'console']);

    expect(mockLog).toHaveBeenCalledTimes(1);
    expect(mockLog.mock.calls[0][0]).toContain('Usage:');
    expect(mockLog.mock.calls[0][0]).toContain('testCommand <myArgument>');
    expect(mockLog.mock.calls[0][0]).toContain('mycli');
    expect(mockExit).toHaveBeenCalled();
    mockExit.mockRestore();
    mockLog.mockRestore();
    mockLogError.mockRestore();
});

it('Should execute an auto registered command', async () => {
    const mockExit = jest.spyOn(process, 'exit').mockImplementation();
    const mockLog = jest.spyOn(process.stdout, 'write').mockImplementation();
    const mockLogError = jest.spyOn(console, 'error').mockImplementation();

    app.boot([process.argv0, 'console', 'testCommand', 'helloworld']);
    expect(mockLog).toHaveBeenCalledTimes(1);
    expect(mockLog.mock.calls[0][0]).toBe('helloworld');
    expect(mockExit).toHaveBeenCalled();
    mockExit.mockRestore();
    mockLog.mockRestore();
    mockLogError.mockRestore();
});

it('Should display help of an auto registered subcommand', async () => {
    const mockExit = jest.spyOn(process, 'exit').mockImplementation();
    const mockLog = jest.spyOn(process.stdout, 'write').mockImplementation();
    const mockLogError = jest.spyOn(console, 'error').mockImplementation();

    app.boot([process.argv0, 'console', 'mycli']);

    expect(mockLog).toHaveBeenCalledTimes(1);
    expect(mockLog.mock.calls[0][0]).toContain('Usage:');
    expect(mockLog.mock.calls[0][0]).toContain(
        'A complete cli provided by a service class'
    );
    expect(mockLog.mock.calls[0][0]).toContain(
        'subcommand [options] <myArgument>  A sub command to test decorators'
    );
    expect(mockExit).toHaveBeenCalled();
    mockExit.mockRestore();
    mockLog.mockRestore();
    mockLogError.mockRestore();
});

it('Should execute an auto registered subcommand', async () => {
    const mockExit = jest.spyOn(process, 'exit').mockImplementation();
    const mockLog = jest.spyOn(process.stdout, 'write').mockImplementation();
    const mockLogError = jest.spyOn(console, 'error').mockImplementation();

    app.boot([
        process.argv0,
        'console',
        'mycli',
        'subcommand',
        '-o',
        'TEST_OPTIONAL_VALUE',
        'TEST_ARGUMENT'
    ]);

    expect(mockLog).toHaveBeenCalledTimes(2);
    expect(mockLog.mock.calls[0][0]).toBe('TEST_ARGUMENT');
    expect(mockLog.mock.calls[1][0]).toBe('TEST_OPTIONAL_VALUE');
    expect(mockExit).toHaveBeenCalled();
    mockExit.mockRestore();
    mockLog.mockRestore();
    mockLogError.mockRestore();
});
