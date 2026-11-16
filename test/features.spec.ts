import {
    ArgumentsHost,
    CallHandler,
    CanActivate,
    Catch,
    createParamDecorator,
    ExceptionFilter,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    Module,
    NestInterceptor,
    OnModuleDestroy,
    ParseIntPipe,
    UseFilters,
    UseGuards,
    UseInterceptors,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import * as commander from 'commander';
import { map } from 'rxjs';

import { BootstrapConsole } from '../src/bootstrap/console';
import { CONSOLE_CONTEXT_TYPE, ConsoleContextType } from '../src/constants';
import { Arg, Cmd, Command, Console, Opt } from '../src/decorators';
import { ConsoleModule } from '../src/module';
import { ConsoleService } from '../src/service';
import { runCommand } from '../src/testing';

const createModule = (...providers: any[]): any => {
    @Module({ imports: [ConsoleModule], providers })
    class FeatureModule {}
    return FeatureModule;
};

const run = (argv: string[], ...providers: any[]) =>
    runCommand(argv, { module: createModule(...providers), useDecorators: true });

describe('Groups', () => {
    it('registers a sub group declared before its parent group', async () => {
        @Console({ command: 'parent.child' })
        class Child {
            @Command({ command: 'run' })
            run() {
                return 'child';
            }
        }
        @Console({ command: 'parent' })
        class Parent {
            @Command({ command: 'p' })
            p() {
                return 'parent';
            }
        }
        expect((await run(['parent', 'child', 'run'], Child, Parent)).data).toBe('child');
        expect((await run(['parent', 'p'], Child, Parent)).data).toBe('parent');
    });

    it('creates the missing parent groups', async () => {
        @Console({ command: 'a.b.c', description: 'deep' })
        class Deep {
            @Command({ command: 'run' })
            run() {
                return 'deep';
            }
        }
        const result = await run(['a', 'b', 'c', 'run'], Deep);
        expect(result.data).toBe('deep');
    });
});

describe('Scanner', () => {
    it('registers the commands inherited from all the parent classes', async () => {
        class Base {
            @Command({ command: 'base' })
            base() {
                return 'base';
            }
        }
        class Middle extends Base {}
        @Console()
        class Leaf extends Middle {
            @Command({ command: 'leaf' })
            leaf() {
                return 'leaf';
            }
        }
        expect((await run(['base'], Leaf)).data).toBe('base');
        expect((await run(['leaf'], Leaf)).data).toBe('leaf');
    });
});

describe('Service', () => {
    @Console({ command: 'group' })
    class Group {
        @Command({ command: 'cmd <value>', options: [{ flags: '-f, --flag' }] })
        cmd(value: string, options: { flag?: boolean }) {
            return { value, flag: options.flag };
        }
    }

    const init = async () => {
        const bootstrap = new BootstrapConsole({ module: createModule(Group), useDecorators: true });
        const app = await bootstrap.init();
        return { bootstrap, app, cli: bootstrap.getService().getRootCli() };
    };

    it('applies the settings of the root cli to the sub commands', async () => {
        const { bootstrap, app, cli } = await init();
        const writeErr = jest.fn();
        cli.exitOverride().configureOutput({ writeErr });
        await expect(bootstrap.boot(['node', 'cli', 'group', 'cmd', 'x', '--nope'])).rejects.toBeInstanceOf(
            commander.CommanderError
        );
        expect(writeErr).toHaveBeenCalledWith(expect.stringContaining(`unknown option '--nope'`));
        await app.close();
    });

    it('keeps the settings set on a sub command', async () => {
        const { bootstrap, app, cli } = await init();
        const rootErr = jest.fn();
        const commandErr = jest.fn();
        cli.exitOverride().configureOutput({ writeErr: rootErr });
        bootstrap.getService().getCli('group.cmd')?.configureOutput({ writeErr: commandErr });
        await expect(bootstrap.boot(['node', 'cli', 'group', 'cmd'])).rejects.toThrow('missing required argument');
        expect(commandErr).toHaveBeenCalled();
        expect(rootErr).not.toHaveBeenCalled();
        await app.close();
    });

    it('rejects when an async hook fails', async () => {
        const { bootstrap, app, cli } = await init();
        cli.hook('preAction', async () => {
            throw new Error('hook failed');
        });
        await expect(bootstrap.boot(['node', 'cli', 'group', 'cmd', 'x'])).rejects.toThrow('hook failed');
        await app.close();
    });

    // commander resets the options before each parse since v13
    const itCommander13 =
        typeof (commander.Command.prototype as any).restoreStateBeforeParse === 'function' ? it : it.skip;
    itCommander13('resets the options between two parses', async () => {
        const { bootstrap, app } = await init();
        expect((await bootstrap.boot(['node', 'cli', 'group', 'cmd', 'x', '--flag'])).data).toEqual({
            value: 'x',
            flag: true
        });
        expect((await bootstrap.boot(['node', 'cli', 'group', 'cmd', 'y'])).data).toEqual({
            value: 'y',
            flag: undefined
        });
        await app.close();
    });

    it('resolves with the root cli when no command is executed', async () => {
        const bootstrap = new BootstrapConsole({ module: createModule() });
        const app = await bootstrap.init();
        const cli = bootstrap.getService().getRootCli();
        cli.option('--global');
        const response = await bootstrap.boot(['node', 'cli', '--global']);
        expect(response.data).toBeUndefined();
        expect(response.command).toBe(cli);
        await app.close();
    });

    it('rejects boot() before init()', async () => {
        const bootstrap = new BootstrapConsole({ module: createModule() });
        await expect(bootstrap.boot()).rejects.toThrow('call init() before boot()');
    });

    it('explains how to fix a missing ConsoleModule import', async () => {
        @Module({})
        class NoConsoleModule {}
        const bootstrap = new BootstrapConsole({ module: NoConsoleModule });
        await expect(bootstrap.init()).rejects.toThrow('import ConsoleModule in the module "NoConsoleModule"');
    });
});

describe('Command settings', () => {
    @Console()
    class Settings {
        @Command({
            command: 'deploy',
            description: 'Deploy the application',
            summary: 'Deploy',
            aliases: ['d', 'ship'],
            arguments: [
                { name: '<env>', description: 'the environment', choices: ['staging', 'production'] },
                { name: '[count]', description: 'the number of instances', fn: (v) => parseInt(v, 10), defaultValue: 1 }
            ],
            options: [
                { flags: '-r, --region <region>', choices: ['eu', 'us'], defaultValue: 'eu' },
                { flags: '--token <token>', env: 'TEST_DEPLOY_TOKEN' },
                { flags: '--dry-run', conflicts: 'force' },
                { flags: '--force' },
                { flags: '--verbose', implies: { logLevel: 'debug' } },
                { flags: '--log-level <level>', defaultValue: 'info' },
                { flags: '--color [color]', preset: 'blue' },
                { flags: '--secret', hidden: true },
                new commander.Option('--timeout <ms>').argParser((v) => parseInt(v, 10))
            ],
            helpText: { after: '\nExample: cli deploy staging' }
        })
        deploy(env: string, count: number, options: Record<string, unknown>) {
            return { env, count, options };
        }

        @Command({ command: 'hidden', hidden: true })
        hidden() {
            return 'hidden';
        }

        @Command({ command: 'extra <a>', allowExcessArguments: true })
        extra(a: string, options: unknown, command: commander.Command) {
            return command.args;
        }

        @Command({ command: 'configured', configure: (c) => c.option('--configured') })
        configured(options: unknown) {
            return options;
        }
    }

    const runSettings = (argv: string[]) => run(argv, Settings);

    it('uses the arguments and the options', async () => {
        process.env.TEST_DEPLOY_TOKEN = 'from-env';
        const { data, error } = await runSettings(['ship', 'staging', '3', '--verbose', '--color', '--timeout', '10']);
        delete process.env.TEST_DEPLOY_TOKEN;
        expect(error).toBeUndefined();
        expect(data).toEqual({
            env: 'staging',
            count: 3,
            options: {
                region: 'eu',
                token: 'from-env',
                verbose: true,
                logLevel: 'debug',
                color: 'blue',
                timeout: 10
            }
        });
    });

    it('uses the default value of an argument', async () => {
        expect((await runSettings(['deploy', 'production'])).data.count).toBe(1);
    });

    it('validates the choices', async () => {
        const argument = await runSettings(['deploy', 'dev']);
        expect(argument.exitCode).toBe(1);
        expect(argument.stderr).toContain(`Allowed choices are staging, production`);
        const option = await runSettings(['deploy', 'staging', '--region', 'asia']);
        expect(option.stderr).toContain(`Allowed choices are eu, us`);
    });

    it('validates the conflicts', async () => {
        const { stderr } = await runSettings(['deploy', 'staging', '--dry-run', '--force']);
        expect(stderr).toContain('cannot be used with option');
    });

    it('displays the help', async () => {
        const help = await runSettings(['deploy', '--help']);
        expect(help.exitCode).toBe(0);
        expect(help.stdout).toContain('Deploy the application');
        expect(help.stdout).toContain('deploy|d [options] <env> [count]');
        expect(help.stdout).toContain('the environment');
        expect(help.stdout).toContain('Example: cli deploy staging');
        expect(help.stdout).not.toContain('--secret');

        const rootHelp = await runSettings(['--help']);
        expect(rootHelp.stdout).toMatch(/deploy\|d .*Deploy\n/);
        expect(rootHelp.stdout).not.toContain('hidden');
    });

    it('runs a hidden command', async () => {
        expect((await runSettings(['hidden'])).data).toBe('hidden');
    });

    it('allows excess arguments', async () => {
        expect((await runSettings(['extra', 'a', 'b'])).data).toEqual(['a', 'b']);
    });

    it('calls configure', async () => {
        expect((await runSettings(['configured', '--configured'])).data).toEqual({ configured: true });
    });

    it('uses the help groups, the usage and the help settings', async () => {
        @Console({ command: 'tools', enablePositionalOptions: true, showHelpAfterError: '(run with --help)' })
        class Tools {
            @Command({ command: 'lint', usage: '[files]', options: [{ flags: '--fix' }] })
            lint(options: unknown) {
                return options;
            }

            @Command({ command: 'exec <cmd>', passThroughOptions: true, allowExcessArguments: true })
            exec(cmd: string, options: unknown, command: commander.Command) {
                return command.args;
            }
        }
        const lintHelp = await run(['tools', 'lint', '--help'], Tools);
        expect(lintHelp.stdout).toContain('tools lint [files]');
        // pass through options require positional options on all the parents
        const exec = await runCommand(['tools', 'exec', 'ls', '-la'], {
            module: createModule(Tools),
            useDecorators: true,
            cli: { enablePositionalOptions: true }
        });
        expect(exec.error).toBeUndefined();
        expect(exec.data).toEqual(['ls', '-la']);
        expect((await run(['tools', 'lint', '--nope'], Tools)).stderr).toContain('(run with --help)');
    });

    it('uses the help groups (commander >= 14)', async () => {
        @Console({ command: 'tools' })
        class Tools {
            @Command({ command: 'lint', helpGroup: 'Quality:', options: [{ flags: '--fix', helpGroup: 'Fixes:' }] })
            lint() {}
        }
        if (typeof (commander.Command.prototype as any).helpGroup !== 'function') {
            await expect(run(['tools', '--help'], Tools)).rejects.toThrow('requires commander >= 14');
            return;
        }
        expect((await run(['tools', '--help'], Tools)).stdout).toContain('Quality:\n  lint');
        expect((await run(['tools', 'lint', '--help'], Tools)).stdout).toContain('Fixes:\n  --fix');
    });

    it('fails for an unknown argument name', async () => {
        @Console()
        class Unknown {
            @Command({ command: 'unknown <a>' })
            unknown(@Arg('b') b: string) {
                return b;
            }
        }
        expect(((await run(['unknown', 'x'], Unknown)).error as Error).message).toBe(
            'The command "unknown" has no argument "b"'
        );
    });

    it('runs the default command', async () => {
        @Console({ command: 'db' })
        class Db {
            @Command({ command: 'migrate', isDefault: true })
            migrate() {
                return 'migrate';
            }
        }
        expect((await run(['db'], Db)).data).toBe('migrate');
    });
});

describe('Parameter decorators and enhancers', () => {
    class CreateUserOptions {
        @IsString()
        name: string;

        @IsOptional()
        @Type(() => Number)
        @IsInt()
        @Min(1)
        @Max(120)
        age?: number;
    }

    const Upper = createParamDecorator((data: string, ctx: ExecutionContext) =>
        String(ctx.getArgByIndex(0)).toUpperCase()
    );

    @Injectable()
    class DenyGuard implements CanActivate {
        canActivate(context: ExecutionContext): boolean {
            return context.getType<ConsoleContextType>() !== CONSOLE_CONTEXT_TYPE;
        }
    }

    @Injectable()
    class WrapInterceptor implements NestInterceptor {
        intercept(context: ExecutionContext, next: CallHandler) {
            return next.handle().pipe(map((data) => ({ wrapped: data, type: context.getType() })));
        }
    }

    @Catch(ForbiddenException)
    class ForbiddenFilter implements ExceptionFilter {
        catch(exception: ForbiddenException, host: ArgumentsHost) {
            return `caught ${exception.message} in ${host.getType()}`;
        }
    }

    @Console({ command: 'user' })
    class Users {
        @Command({ command: 'show <id> [fields...]', options: [{ flags: '--dry-run' }] })
        show(
            @Arg('id', ParseIntPipe) id: number,
            @Arg('fields') fields: string[] | undefined,
            @Opt('dryRun') dryRun: boolean | undefined,
            @Opt() options: Record<string, unknown>,
            @Arg() args: Record<string, unknown>,
            @Cmd() command: commander.Command
        ) {
            return { id, fields, dryRun, options, args, command: command.name() };
        }

        @Command({ command: 'create', options: [{ flags: '--name <name>' }, { flags: '--age <age>' }] })
        @UsePipes(new ValidationPipe({ transform: true }))
        create(@Opt() options: CreateUserOptions) {
            return options;
        }

        @Command({ command: 'port', options: [{ flags: '--port <port>' }] })
        portWithParseInt(@Opt('port', ParseIntPipe) port: number) {
            return port;
        }

        @Command({ command: 'port2', options: [{ flags: '--port <port>' }] })
        port(@Opt('port', new ValidationPipe({ transform: true })) port: number) {
            return port;
        }

        @Command({ command: 'upper <name>' })
        upper(@Upper() name: string) {
            return name;
        }

        @Command({ command: 'denied' })
        @UseGuards(DenyGuard)
        denied() {
            return 'should not run';
        }

        @Command({ command: 'filtered' })
        @UseGuards(DenyGuard)
        @UseFilters(ForbiddenFilter)
        filtered() {
            return 'should not run';
        }

        @Command({ command: 'wrapped <value>' })
        @UseInterceptors(WrapInterceptor)
        wrapped(value: string) {
            return value;
        }
    }

    const runUsers = (argv: string[]) => run(['user', ...argv], Users);

    it('injects the arguments, the options and the command', async () => {
        const { data, error } = await runUsers(['show', '42', 'name', 'email', '--dry-run']);
        expect(error).toBeUndefined();
        expect(data).toEqual({
            id: 42,
            fields: ['name', 'email'],
            dryRun: true,
            options: { dryRun: true },
            args: { id: '42', fields: ['name', 'email'] },
            command: 'show'
        });
    });

    it('fails when a pipe fails', async () => {
        const { error, exitCode } = await runUsers(['show', 'abc']);
        expect(exitCode).toBe(1);
        expect((error as Error).message).toContain('numeric string is expected');
    });

    it('validates and transforms the options with the ValidationPipe', async () => {
        const valid = await runUsers(['create', '--name', 'john', '--age', '42']);
        expect(valid.data).toBeInstanceOf(CreateUserOptions);
        expect(valid.data).toEqual({ name: 'john', age: 42 });

        const invalid = await runUsers(['create', '--name', 'john', '--age', '200']);
        expect((invalid.error as any).getResponse().message).toEqual(['age must not be greater than 120']);
    });

    it('transforms an option with a pipe', async () => {
        expect((await runUsers(['port', '--port', '8080'])).data).toBe(8080);
    });

    it('transforms a primitive option with the ValidationPipe', async () => {
        expect((await runUsers(['port2', '--port', '8080'])).data).toBe(8080);
    });

    it('supports custom param decorators', async () => {
        expect((await runUsers(['upper', 'john'])).data).toBe('JOHN');
    });

    it('runs the guards', async () => {
        const { error } = await runUsers(['denied']);
        expect(error).toBeInstanceOf(ForbiddenException);
    });

    it('runs the exception filters', async () => {
        expect((await runUsers(['filtered'])).data).toBe('caught Forbidden resource in console');
    });

    it('runs the interceptors', async () => {
        expect((await runUsers(['wrapped', 'x'])).data).toEqual({ wrapped: 'x', type: 'console' });
    });

    it('applies the global enhancers only to the commands that use the execution context', async () => {
        @Injectable()
        class DenyAll implements CanActivate {
            canActivate(): boolean {
                return false;
            }
        }
        @Console()
        class Commands {
            @Command({ command: 'plain <value>' })
            plain(value: string) {
                return value;
            }

            @Command({ command: 'decorated <value>' })
            decorated(@Arg('value') value: string) {
                return value;
            }
        }
        @Module({ imports: [ConsoleModule], providers: [Commands, { provide: APP_GUARD, useClass: DenyAll }] })
        class GlobalGuardModule {}
        const options = { module: GlobalGuardModule, useDecorators: true };
        expect((await runCommand(['plain', 'x'], options)).data).toBe('x');
        // the global enhancers are applied by NestJS >= 10
        const nestMajor = parseInt(require('@nestjs/core/package.json').version, 10);
        const decorated = await runCommand(['decorated', 'x'], options);
        if (nestMajor >= 10) {
            expect(decorated.error).toBeInstanceOf(ForbiddenException);
        } else {
            expect(decorated.data).toBe('x');
        }
    });

    it('does not log errors with the nest logger when no filter is declared', async () => {
        const stderr = jest.spyOn(process.stderr, 'write').mockImplementation(() => true);
        const consoleError = jest.spyOn(console, 'error').mockImplementation();
        await runUsers(['denied']);
        expect(stderr).not.toHaveBeenCalled();
        expect(consoleError).not.toHaveBeenCalled();
        stderr.mockRestore();
        consoleError.mockRestore();
    });
});

describe('Bootstrap', () => {
    const destroyed = jest.fn();

    @Console()
    class Cli implements OnModuleDestroy {
        @Command({ command: 'ok' })
        ok() {
            return 'ok';
        }

        @Command({ command: 'fail' })
        fail() {
            throw new Error('failed');
        }

        onModuleDestroy() {
            destroyed();
        }
    }

    let exitCode: typeof process.exitCode;
    beforeEach(() => {
        exitCode = process.exitCode;
        destroyed.mockReset();
    });
    afterEach(() => {
        process.exitCode = exitCode;
    });

    const createBootstrap = (writeErr = jest.fn(), writeOut = jest.fn()) =>
        new BootstrapConsole({
            module: createModule(Cli),
            useDecorators: true,
            cli: {
                name: 'my-cli',
                description: 'My cli',
                version: '1.2.3',
                output: { writeErr, writeOut }
            }
        });

    it('configures the root cli', async () => {
        const writeOut = jest.fn();
        await createBootstrap(jest.fn(), writeOut).run(['--help'], { from: 'user' });
        const help = writeOut.mock.calls.join('');
        expect(help).toContain('Usage: my-cli [options] [command]');
        expect(help).toContain('My cli');
        expect(help).toContain('-V, --version');
    });

    it('run() returns the response and closes the application', async () => {
        const response = await createBootstrap().run(['ok'], { from: 'user' });
        expect(response?.data).toBe('ok');
        expect(destroyed).toHaveBeenCalledTimes(1);
        expect(process.exitCode).toBe(exitCode);
    });

    it('run() prints the error, sets the exit code and closes the application', async () => {
        const writeErr = jest.fn();
        expect(await createBootstrap(writeErr).run(['fail'], { from: 'user' })).toBeUndefined();
        expect(writeErr).toHaveBeenCalledWith(expect.stringContaining('Error: failed'));
        expect(process.exitCode).toBe(1);
        expect(destroyed).toHaveBeenCalledTimes(1);
    });

    it('run() uses the exit code of commander and closes the application', async () => {
        const writeOut = jest.fn();
        await createBootstrap(jest.fn(), writeOut).run(['--version'], { from: 'user' });
        expect(writeOut).toHaveBeenCalledWith('1.2.3\n');
        expect(process.exitCode).toBe(0);

        const writeErr = jest.fn();
        await createBootstrap(writeErr).run(['unknown'], { from: 'user' });
        expect(writeErr).toHaveBeenCalledWith(expect.stringContaining(`unknown command 'unknown'`));
        expect(process.exitCode).toBe(1);
        expect(destroyed).toHaveBeenCalledTimes(2);
    });
});

describe('runCommand', () => {
    @Injectable()
    class Greeter {
        greet(name: string) {
            return `hello ${name}`;
        }
    }

    @Console()
    class Cli {
        constructor(private readonly greeter: Greeter) {}

        @Command({ command: 'greet <name>' })
        greet(name: string) {
            return this.greeter.greet(name);
        }
    }

    it('runs with a testing module that overrides providers', async () => {
        const result = await runCommand(['greet', 'john'], {
            useDecorators: true,
            create: () =>
                Test.createTestingModule({ imports: [createModule(Cli, Greeter)] })
                    .overrideProvider(Greeter)
                    .useValue({ greet: (name: string) => `mocked ${name}` })
                    .compile()
        });
        expect(result).toEqual({ data: 'mocked john', exitCode: 0, stdout: '', stderr: '' });
    });

    it('works with commands created with the service', async () => {
        @Injectable()
        class Commands {
            constructor(service: ConsoleService) {
                service.createCommand({ command: 'manual' }, () => 'manual', service.getRootCli());
            }
        }
        expect((await runCommand(['manual'], { module: createModule(Commands) })).data).toBe('manual');
    });
});
