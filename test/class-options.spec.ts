import { Module, ValidationPipe } from '@nestjs/common';
import { IsIn, IsInt, Max } from 'class-validator';
import * as commander from 'commander';

import { Command, Console, ConsoleOption, getClassOptions, Opt } from '../src/decorators.js';
import { ConsoleModule } from '../src/module.js';
import { runCommand } from '../src/testing.js';

class BaseOptions {
    @ConsoleOption({ description: 'Display more logs' })
    verbose?: boolean;
}

class DeployOptions extends BaseOptions {
    @ConsoleOption({ description: 'The environment', choices: ['staging', 'production'], required: true })
    @IsIn(['staging', 'production'])
    env: string;

    @ConsoleOption({ short: 'p', defaultValue: 80 })
    @IsInt()
    @Max(65535)
    port: number;

    @ConsoleOption()
    dryRun?: boolean;

    @ConsoleOption()
    tags?: string[];

    @ConsoleOption({ flags: '--log-level <level>' })
    logLevel?: string;
}

@Console()
class Cli {
    @Command({ command: 'deploy' })
    deploy(@Opt() options: DeployOptions) {
        return options;
    }

    @Command({ command: 'validated' })
    validated(@Opt(new ValidationPipe({ transform: true })) options: DeployOptions) {
        return options;
    }

    @Command({ command: 'override', options: [{ flags: '--env <env>', defaultValue: 'staging' }] })
    override(@Opt() options: DeployOptions) {
        return options;
    }

    @Command({ command: 'single', options: [{ flags: '--name <name>' }] })
    single(@Opt('name') name: string) {
        return name;
    }
}

@Module({ imports: [ConsoleModule], providers: [Cli] })
class ClassOptionsModule {}

const run = (argv: string[]) => runCommand(argv, { module: ClassOptionsModule, useDecorators: true });

describe('Class options', () => {
    it('creates the options from the properties', () => {
        expect(getClassOptions(DeployOptions).map((option) => option.flags)).toEqual([
            '--verbose',
            '--env <env>',
            '-p, --port <port>',
            '--dry-run',
            '--tags <tags...>',
            '--log-level <level>'
        ]);
        expect(getClassOptions(BaseOptions).map((option) => option.flags)).toEqual(['--verbose']);
        expect(getClassOptions(undefined)).toEqual([]);
    });

    it('adds the options to the command', async () => {
        const result = await run([
            'deploy',
            '--env',
            'staging',
            '-p',
            '8080',
            '--dry-run',
            '--tags',
            'a',
            'b',
            '--verbose'
        ]);
        expect(result.error).toBeUndefined();
        expect(result.data).toEqual({ env: 'staging', port: 8080, dryRun: true, tags: ['a', 'b'], verbose: true });
    });

    it('uses the settings of the options', async () => {
        expect((await run(['deploy'])).stderr).toContain(`required option '--env <env>' not specified`);
        expect((await run(['deploy', '--env', 'dev'])).stderr).toContain('Allowed choices are staging, production');
        expect((await run(['deploy', '--env', 'staging', '--port', 'abc'])).stderr).toContain('Not a number.');
        expect((await run(['deploy', '--env', 'staging'])).data.port).toBe(80);
        const help = await run(['deploy', '--help']);
        expect(help.stdout).toContain('--verbose');
        expect(help.stdout).toContain('Display more logs');
    });

    it('validates the options', async () => {
        const valid = await run(['validated', '--env', 'production']);
        expect(valid.data).toBeInstanceOf(DeployOptions);
        const invalid = await run(['validated', '--env', 'production', '--port', '70000']);
        expect((invalid.error as any).getResponse().message).toEqual(['port must not be greater than 65535']);
    });

    it('keeps the options declared in the command', async () => {
        const result = await run(['override']);
        expect(result.error).toBeUndefined();
        expect(result.data.env).toBe('staging');
    });

    it('does not add options for a single option parameter', async () => {
        expect((await run(['single', '--name', 'x'])).data).toBe('x');
    });

    it('can be used with createCommand', () => {
        const command = new commander.Command();
        for (const option of getClassOptions(DeployOptions)) {
            command.option(option.flags, option.description);
        }
        expect(command.options.map((option) => option.attributeName())).toContain('dryRun');
    });

    it('works without the design types (eg code built without decorator metadata)', async () => {
        class NoMetadata {
            run(options: unknown) {
                return options;
            }
        }
        // applied by hand, so typescript does not emit the parameter types
        Opt()(NoMetadata.prototype, 'run', 0);
        Command({ command: 'run', options: [{ flags: '--x' }] })(
            NoMetadata.prototype,
            'run',
            Object.getOwnPropertyDescriptor(NoMetadata.prototype, 'run')!
        );
        Console()(NoMetadata);
        @Module({ imports: [ConsoleModule], providers: [NoMetadata] })
        class NoMetadataModule {}
        expect((await runCommand(['run', '--x'], { module: NoMetadataModule, useDecorators: true })).data).toEqual({
            x: true
        });
    });

    it('only decorates properties with a string name', () => {
        expect(() => ConsoleOption()(class {}.prototype, Symbol('x'))).toThrow('string name');
    });
});
