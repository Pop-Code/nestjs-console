import { Module } from '@nestjs/common';
import * as commander from 'commander';

import { getCompletions, getCompletionScript } from '../src/completion';
import { Command, Console } from '../src/decorators';
import { ConsoleModule } from '../src/module';
import { runCommand } from '../src/testing';

@Console({ command: 'db', description: 'Database commands' })
class DbCli {
    @Command({
        command: 'migrate',
        options: [
            { flags: '-e, --env <env>', choices: ['dev', 'prod'] },
            { flags: '--dry-run' },
            { flags: '--secret', hidden: true }
        ]
    })
    migrate() {}

    @Command({ command: 'seed', alias: 's', arguments: [{ name: '<size>', choices: ['small', 'large'] }] })
    seed() {}
}

@Console()
class RootCli {
    @Command({ command: 'hello [names...]', arguments: [] })
    hello() {}

    @Command({ command: 'internal', hidden: true })
    internal() {}
}

@Module({ imports: [ConsoleModule], providers: [DbCli, RootCli] })
class CompletionModule {}

const complete = async (...words: string[]) => {
    const result = await runCommand(['__complete', '--', ...words], {
        module: CompletionModule,
        useDecorators: true,
        completion: true,
        cli: { name: 'my-cli' }
    });
    expect(result.error).toBeUndefined();
    return result.stdout.split('\n').filter(Boolean);
};

describe('Completion', () => {
    it('completes the commands', async () => {
        expect(await complete('')).toEqual(['hello', 'db', 'completion', 'help']);
        expect(await complete('h')).toEqual(['hello', 'help']);
    });

    it('completes the sub commands, using aliases', async () => {
        expect(await complete('db', '')).toEqual(['migrate', 'seed', 'help']);
        expect(await complete('db', 's', '')).toEqual(['small', 'large']);
    });

    it('completes the options', async () => {
        expect(await complete('db', 'migrate', '-')).toEqual(['--env', '-e', '--dry-run', '--help', '-h']);
        expect(await complete('db', 'migrate', '--d')).toEqual(['--dry-run']);
    });

    it('completes the choices of an option', async () => {
        expect(await complete('db', 'migrate', '--env', '')).toEqual(['dev', 'prod']);
        expect(await complete('db', 'migrate', '-e', 'p')).toEqual(['prod']);
        expect(await complete('db', 'migrate', '--env=dev', '--')).toEqual(['--dry-run', '--help']);
    });

    it('completes the choices of an argument', async () => {
        expect(await complete('db', 'seed', 'l')).toEqual(['large']);
        expect(await complete('db', 'seed', 'large', '')).toEqual([]);
    });

    it('completes the shells of the completion command', async () => {
        expect(await complete('completion', '')).toEqual(['bash', 'zsh', 'fish']);
    });

    it('prints the completion scripts', async () => {
        for (const shell of ['bash', 'zsh', 'fish']) {
            const result = await runCommand(['completion', shell], {
                module: CompletionModule,
                useDecorators: true,
                completion: { programName: 'my-cli' }
            });
            expect(result.stdout).toBe(getCompletionScript(shell as any, 'my-cli'));
            expect(result.stdout).toContain('my-cli __complete --');
        }
    });

    it('uses a custom completion command name', async () => {
        const result = await runCommand(['--help'], {
            module: CompletionModule,
            completion: { command: 'shell-completion' }
        });
        expect(result.stdout).toContain('shell-completion');
        expect(result.stdout).not.toContain('__complete');
    });

    it('completes a commander tree', () => {
        const root = new commander.Command().addCommand(new commander.Command('build').option('--watch'));
        expect(getCompletions(root, ['b'])).toEqual(['build']);
        expect(getCompletions(root, ['build', '--'])).toEqual(['--watch', '--help']);
        expect(getCompletions(root, ['build', '--', ''])).toEqual([]);
    });

    it('rejects an unknown shell', () => {
        expect(() => getCompletionScript('powershell' as any, 'my-cli')).toThrow('Unsupported shell');
    });

    it('completes without words', async () => {
        const result = await runCommand(['__complete'], { module: CompletionModule, completion: true });
        expect(result.stdout).toBe('completion\nhelp\n');
    });
});
