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

    app.boot([process.argv0, '']);

    expect(mockLog).toHaveBeenCalledTimes(1);
    expect(mockLog.mock.calls[0][0]).toContain('Usage:');
    expect(mockLog.mock.calls[0][0]).toContain('testCommand <myArgument>');
    expect(mockLog.mock.calls[0][0]).toContain('MyServiceCli');
    expect(mockExit).toHaveBeenCalled();

    mockExit.mockRestore();
    mockLog.mockRestore();
    mockLogError.mockRestore();
});

it('Should execute an auto registered command', async () => {
    const mockExit = jest.spyOn(process, 'exit').mockImplementation();
    const mockLog = jest.spyOn(process.stdout, 'write').mockImplementation();
    const mockLogError = jest.spyOn(console, 'error').mockImplementation();

    app.boot([process.argv0, 'testCommand', 'helloworld']);
    expect(mockLog).toHaveBeenCalledTimes(3);
    expect(mockLog.mock.calls[0][0]).toContain('helloworld');
    expect(mockExit).toHaveBeenCalled();
    mockExit.mockRestore();
    mockLog.mockRestore();
    mockLogError.mockRestore();
});

it('Should execute an auto registered subcommand', async () => {
    const mockExit = jest.spyOn(process, 'exit').mockImplementation();
    const mockLog = jest.spyOn(process.stdout, 'write').mockImplementation();
    const mockLogError = jest.spyOn(console, 'error').mockImplementation();

    app.boot([process.argv0, 'console', 'MyServiceCli']);

    expect(mockLog).toHaveBeenCalledTimes(1);
    expect(mockLog.mock.calls[0][0]).toContain(
        'A complete cli provided by a service class'
    );
    expect(mockExit).toHaveBeenCalled();
    mockExit.mockRestore();
    mockLog.mockRestore();
    mockLogError.mockRestore();
});
