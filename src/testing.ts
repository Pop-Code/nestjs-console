/**
 * @module Testing
 */
import { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as commander from 'commander';
import { Readable, Writable } from 'stream';

import { AbstractBootstrapConsole, CommonBootstrapConsoleOptions } from './bootstrap/abstract';

export interface RunCommandOptions extends Omit<CommonBootstrapConsoleOptions, 'module'> {
    /**
     * The module of the application (not needed when `create` is set)
     */
    module?: any;

    /**
     * Create the application yourself, eg to override providers:
     * `() => Test.createTestingModule({ imports: [AppModule] }).overrideProvider(Db).useValue(db).compile()`
     */
    create?: () => Promise<INestApplicationContext>;

    /**
     * The answers to the questions asked by the command (prompts), one per question.
     * Without answers, the prompts are not interactive.
     */
    answers?: string[];
}

export interface RunCommandResult<D = any> {
    /**
     * The value returned by the command handler
     */
    data?: D;

    /**
     * The error thrown by the command, or the CommanderError (unknown command, missing argument, help displayed...)
     */
    error?: unknown;

    /**
     * 0 on success, commander's exit code for commander errors, 1 for other errors
     */
    exitCode: number;

    /**
     * What commander wrote to stdout (help, version...).
     * Not what the command itself writes with console.log, use a spy for that.
     */
    stdout: string;

    /**
     * What commander wrote to stderr (errors)
     */
    stderr: string;

    /**
     * The questions asked by the prompts
     */
    prompts: string;
}

class TestingBootstrapConsole extends AbstractBootstrapConsole<INestApplicationContext> {
    constructor(
        options: CommonBootstrapConsoleOptions,
        private readonly factory?: () => Promise<INestApplicationContext>
    ) {
        super(options);
    }

    create(): Promise<INestApplicationContext> {
        return this.factory
            ? this.factory()
            : NestFactory.createApplicationContext(this.options.module, this.options.contextOptions);
    }
}

/**
 * Run a command in a new application and return its result, its exit code and the output of commander.
 * The application is closed after the command. The process never exits.
 *
 * @param argv The user arguments, eg `['user', 'create', 'john', '--admin']`
 * @param options The bootstrap options
 */
export const runCommand = async <D = any>(
    argv: readonly string[],
    options: RunCommandOptions
): Promise<RunCommandResult<D>> => {
    const { create, answers, ...bootstrapOptions } = options;
    let stdout = '';
    let stderr = '';
    let prompts = '';
    const bootstrap = new TestingBootstrapConsole(
        {
            ...bootstrapOptions,
            module: bootstrapOptions.module,
            prompt: {
                input: Readable.from(answers ? [answers.map((answer) => `${answer}\n`).join('')] : []),
                output: new Writable({
                    write: (chunk, _encoding, callback) => {
                        prompts += chunk.toString();
                        callback();
                    }
                }),
                interactive: answers !== undefined
            },
            cli: {
                ...bootstrapOptions.cli,
                exitOverride: true,
                output: {
                    ...bootstrapOptions.cli?.output,
                    writeOut: (str) => (stdout += str),
                    writeErr: (str) => (stderr += str)
                }
            }
        },
        create
    );
    const app = await bootstrap.init();
    try {
        await app.init();
        const response = await bootstrap.boot(argv, { from: 'user' });
        return { data: response.data, exitCode: 0, stdout, stderr, prompts };
    } catch (error) {
        const exitCode = error instanceof commander.CommanderError ? error.exitCode : 1;
        return { error, exitCode, stdout, stderr, prompts };
    } finally {
        await app.close();
    }
};
