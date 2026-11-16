import { Module } from '@nestjs/common';
import { PassThrough } from 'stream';

import { BootstrapConsole } from '../src/bootstrap/console';
import { Command, Console } from '../src/decorators';
import { ConsoleModule } from '../src/module';
import { PromptError, PromptService } from '../src/prompt';
import { runCommand } from '../src/testing';

const createPrompt = (interactive = true) => {
    const input = new PassThrough();
    const output = new PassThrough();
    let written = '';
    output.on('data', (chunk) => (written += chunk.toString()));
    const prompt = new PromptService().configure({ input, output, interactive });
    return { prompt, input, output: () => written };
};

describe('PromptService', () => {
    it('asks for a text', async () => {
        const { prompt, input, output } = createPrompt();
        input.write('john\n');
        expect(await prompt.input('Name?')).toBe('john');
        expect(output()).toBe('Name? ');
    });

    it('uses the default value', async () => {
        const { prompt, input, output } = createPrompt();
        input.write('\n');
        expect(await prompt.input('Name?', { default: 'jane' })).toBe('jane');
        expect(output()).toBe('Name? (jane) ');
    });

    it('asks again when the answer is invalid', async () => {
        const { prompt, input, output } = createPrompt();
        input.write('x\nlong enough\n');
        const validate = (answer: string) => answer.length > 3 || 'Too short';
        expect(await prompt.input('Name?', { validate })).toBe('long enough');
        expect(output()).toBe('Name? Too short\nName? ');
    });

    it('keeps the answers sent in one chunk for the next questions', async () => {
        const { prompt, input } = createPrompt();
        input.write('a\r\nb\n');
        expect(await prompt.input('1?')).toBe('a');
        expect(await prompt.input('2?')).toBe('b');
    });

    it('waits for an answer sent later', async () => {
        const { prompt, input } = createPrompt();
        const answer = prompt.input('Name?');
        input.write('jo');
        input.write('hn\n');
        expect(await answer).toBe('john');
    });

    it('confirms', async () => {
        const { prompt, input, output } = createPrompt();
        input.write('y\nNO\n\nmaybe\nyes\n');
        expect(await prompt.confirm('Sure?')).toBe(true);
        expect(await prompt.confirm('Sure?')).toBe(false);
        expect(await prompt.confirm('Sure?', true)).toBe(true);
        expect(await prompt.confirm('Sure?')).toBe(true);
        expect(output()).toContain('Sure? (y/N) ');
        expect(output()).toContain('Sure? (Y/n) ');
        expect(output()).toContain('Please answer yes or no\n');
    });

    it('selects a choice by number or by value', async () => {
        const { prompt, input, output } = createPrompt();
        input.write('2\nred\n9\nblue\n\n');
        const colors = ['red', 'blue'] as const;
        expect(await prompt.select('Color?', colors)).toBe('blue');
        expect(await prompt.select('Color?', colors)).toBe('red');
        expect(await prompt.select('Color?', colors)).toBe('blue');
        expect(await prompt.select('Color?', colors, { default: 'red' })).toBe('red');
        expect(output()).toContain('Color?\n  1) red\n  2) blue\nAnswer: ');
        expect(output()).toContain('Choose a number between 1 and 2\n');
    });

    it('rejects a select without choices', async () => {
        const { prompt } = createPrompt();
        await expect(prompt.select('Color?', [])).rejects.toBeInstanceOf(PromptError);
    });

    it('reads a password from a pipe', async () => {
        const { prompt, input } = createPrompt();
        input.write('a\nsecret\n');
        const validate = (answer: string) => answer.length > 1 || 'Too short';
        expect(await prompt.password('Password?', { validate })).toBe('secret');
    });

    it('reads a password without echo from a terminal', async () => {
        const { prompt, input, output } = createPrompt();
        const setRawMode = jest.fn();
        Object.assign(input, { isTTY: true, setRawMode });
        input.write('sex\u007fcret\r');
        expect(await prompt.password('Password?')).toBe('secret');
        expect(setRawMode.mock.calls).toEqual([[true], [false]]);
        expect(output()).toBe('Password? \n');
    });

    it('cancels a password with ctrl+c', async () => {
        const { prompt, input } = createPrompt();
        Object.assign(input, { isTTY: true, setRawMode: jest.fn() });
        input.write('se\u0003');
        await expect(prompt.password('Password?')).rejects.toThrow('Cancelled');
    });

    it('returns the last answer when the input ends', async () => {
        const { prompt, input } = createPrompt();
        input.end('last');
        expect(await prompt.input('Name?')).toBe('last');
        await expect(prompt.input('Name?')).rejects.toThrow('No answer to "Name?": the input ended');
    });

    it('returns the password typed when the input ends', async () => {
        const { prompt, input } = createPrompt();
        Object.assign(input, { isTTY: true, setRawMode: jest.fn() });
        input.end('secret');
        expect(await prompt.password('Password?')).toBe('secret');
    });

    it('rejects when the input fails', async () => {
        const { prompt, input } = createPrompt();
        const answer = prompt.input('Name?');
        input.destroy(new Error('broken'));
        await expect(answer).rejects.toThrow('broken');
    });

    it('does not ask when the input is not interactive', async () => {
        const { prompt } = createPrompt(false);
        expect(prompt.isInteractive()).toBe(false);
        await expect(prompt.input('Name?')).rejects.toThrow('Cannot ask "Name?": the input is not interactive');
    });

    it('writes the questions to stderr by default', async () => {
        const input = new PassThrough();
        const write = jest.spyOn(process.stderr, 'write').mockImplementation(() => true);
        try {
            const prompt = new PromptService().configure({ input, interactive: true });
            input.write('x\n');
            expect(await prompt.input('Name?')).toBe('x');
            expect(write).toHaveBeenCalledWith('Name? ');
        } finally {
            write.mockRestore();
        }
    });

    it('is interactive when stdin is a terminal', () => {
        const prompt = new PromptService();
        expect(prompt.isInteractive()).toBe(!!process.stdin.isTTY);
    });
});

describe('Prompted options and arguments', () => {
    @Console()
    class Cli {
        @Command({
            command: 'create',
            arguments: [
                { name: '<name>', description: 'The name', prompt: true },
                { name: '[tags...]', prompt: 'Tags?' }
            ],
            options: [
                { flags: '--age <age>', prompt: 'Age?', fn: (v) => parseInt(v, 10), required: true },
                { flags: '--role <role>', choices: ['admin', 'user'], defaultValue: 'user', prompt: true },
                { flags: '--admin', description: 'Is admin?', prompt: true },
                { flags: '--no-email', description: 'Disable the emails?', prompt: true },
                { flags: '--token <token>', prompt: { message: 'Token?', password: true } },
                { flags: '--comment <comment>', prompt: { password: false } }
            ]
        })
        create(name: string, tags: string[], options: Record<string, unknown>) {
            return { name, tags, options };
        }
    }

    @Module({ imports: [ConsoleModule], providers: [Cli] })
    class PromptModule {}

    const run = (argv: string[], answers?: string[]) =>
        runCommand(argv, { module: PromptModule, useDecorators: true, answers });

    it('asks the missing values', async () => {
        const result = await run(['create'], ['john', 'a b', '42', '1', 'y', 'n', 'secret', 'hi']);
        expect(result.error).toBeUndefined();
        expect(result.data).toEqual({
            name: 'john',
            tags: ['a', 'b'],
            options: { age: 42, role: 'admin', admin: true, email: true, token: 'secret', comment: 'hi' }
        });
        expect(result.prompts).toContain('The name ');
        expect(result.prompts).toContain('Tags? ');
        expect(result.prompts).toContain('Age? ');
        expect(result.prompts).toContain('--role\n  1) admin\n  2) user\nAnswer: (user) ');
        expect(result.prompts).toContain('Is admin? (y/N) ');
        expect(result.prompts).toContain('Disable the emails? (y/N) ');
        expect(result.prompts).toContain('Token? ');
        expect(result.prompts).toContain('--comment ');
    });

    it('does not ask the values that are passed', async () => {
        const result = await run(
            [
                'create',
                'john',
                'tag',
                '--age',
                '42',
                '--role',
                'admin',
                '--admin',
                '--no-email',
                '--token',
                't',
                '--comment',
                'c'
            ],
            []
        );
        expect(result.data).toEqual({
            name: 'john',
            tags: ['tag'],
            options: { age: 42, role: 'admin', admin: true, email: false, token: 't', comment: 'c' }
        });
        expect(result.prompts).toBe('');
    });

    it('fails for a missing required argument when the input is not interactive', async () => {
        const { exitCode, stderr } = await run(['create']);
        expect(exitCode).toBe(1);
        expect(stderr).toContain(`error: missing required argument 'name'`);
    });

    it('fails for a missing required option when the input is not interactive', async () => {
        const { exitCode, stderr } = await run(['create', 'john']);
        expect(exitCode).toBe(1);
        expect(stderr).toContain(`error: required option '--age <age>' not specified`);
    });

    it('keeps the other missing values when the input is not interactive', async () => {
        const { data } = await run(['create', 'john', '--age', '1']);
        expect(data).toEqual({ name: 'john', tags: [], options: { age: 1, role: 'user', email: true } });
    });

    it('displays a prompted argument as optional in the help', async () => {
        const { stdout } = await run(['create', '--help']);
        expect(stdout).toContain('create [options] [name] [tags...]');
    });

    it('asks the options of a group before a sub command, and uses the flags as question', async () => {
        @Console({ command: 'deploy', options: [{ flags: '-e <env>', prompt: true }] })
        class Deploy {
            @Command({ command: 'run' })
            run(options: unknown, command: any) {
                return command.parent.opts();
            }
        }
        @Module({ imports: [ConsoleModule], providers: [Deploy] })
        class DeployModule {}
        const result = await runCommand(['deploy', 'run'], {
            module: DeployModule,
            useDecorators: true,
            answers: ['prod']
        });
        expect(result.data).toEqual({ e: 'prod' });
        expect(result.prompts).toBe('-e <env> ');
    });

    it('configures the prompts of the bootstrap', async () => {
        const input = new PassThrough();
        const output = new PassThrough();
        input.end('jane\n1\n');
        const response = await new BootstrapConsole({
            module: PromptModule,
            useDecorators: true,
            prompt: { input, output, interactive: true }
        }).run(['create', '--age', '3', '--admin', '--no-email', '--token', 't', '--comment', 'c', '--role', 'user'], {
            from: 'user'
        });
        expect(response?.data.name).toBe('jane');
    });
});
