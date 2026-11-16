/**
 * @module AbstractBootstrapConsole
 */
import { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as commander from 'commander';

import { CompletionOptions, registerCompletion } from '../completion';
import { CommandResponse } from '../interfaces';
import { ConsoleModule } from '../module';
import { CommandSettings, ConsoleService } from '../service';

/**
 * The options of NestFactory.createApplicationContext()
 */
export type NestApplicationContextOptions = NonNullable<Parameters<typeof NestFactory.createApplicationContext>[1]>;

/**
 * The options of the root cli
 */
export interface CliOptions extends Omit<CommandSettings, 'alias' | 'aliases' | 'helpGroup'> {
    /**
     * The name of the cli displayed in the help (default: the name of the script)
     */
    name?: string;

    /**
     * Add a "-V, --version" option that prints this version
     */
    version?: string | { version: string; flags?: string; description?: string };

    /**
     * Throw a CommanderError instead of exiting the process when commander fails or displays the help
     * (always enabled by `run()`)
     */
    exitOverride?: boolean;

    /**
     * Where commander writes the help and the errors
     */
    output?: commander.OutputConfiguration;
}

/**
 * The Common options of the AbstractBootstrapConsole
 */
export interface CommonBootstrapConsoleOptions {
    /**
     * Any static module to load.
     * If you are using a dynamic module as a root module, you must create a module that imports your dynamic module first.
     * "@Module({imports: [MyDynamicModule.register()]})"
     */
    module: any;

    /**
     * If true the BootstrapConsole will scan the application to find Console and Command decorators
     */
    useDecorators?: boolean;

    /**
     * An optional list of Nest Modules to scan. If set, only listed modules will be scanned.
     */
    includeModules?: any[];

    /**
     * The nest application context options
     */
    contextOptions?: NestApplicationContextOptions;

    /**
     * Configure the root cli (name, version, description, global options...)
     */
    cli?: CliOptions;

    /**
     * Add a "completion" command that prints the shell completion script (bash, zsh, fish)
     */
    completion?: boolean | CompletionOptions;
}

/**
 * An abstract class to boot a nest application
 * @param A The type of nest application
 * @param O The options
 */
export abstract class AbstractBootstrapConsole<
    A extends INestApplicationContext,
    O extends CommonBootstrapConsoleOptions = CommonBootstrapConsoleOptions
> {
    /**
     * The console service
     */
    protected service: ConsoleService;

    /**
     * The application container
     */
    protected container: A;

    /**
     * The options to bootstrap
     */
    protected readonly options: O;

    constructor(options: O) {
        this.options = options;

        if (!this.options.contextOptions) {
            this.options.contextOptions = {};
        }
        if (!this.options.contextOptions.logger) {
            this.options.contextOptions.logger = ['error'];
        }
    }

    /**
     * Activate the decorators scanner
     */
    protected async useDecorators(): Promise<this> {
        const consoleModule = this.container.get(ConsoleModule, { strict: false });
        await consoleModule.scan(this.container, this.options.includeModules);
        return this;
    }

    /**
     * Configure the root cli with the "cli" option
     */
    protected configureCli(): void {
        const { name, version, exitOverride, output, ...settings } = this.options.cli ?? {};
        const cli = this.service.getRootCli();
        if (name !== undefined) {
            cli.name(name);
        }
        if (version !== undefined) {
            const { version: value, flags, description } = typeof version === 'string' ? { version } : version;
            cli.version(value, flags, description);
        }
        if (exitOverride) {
            cli.exitOverride();
        }
        if (output !== undefined) {
            cli.configureOutput(output);
        }
        this.service.configureCommand(cli, settings);
    }

    /**
     * Init the console application
     */
    async init(): Promise<A> {
        this.container = await this.create();
        try {
            this.service = this.container.get(ConsoleService, { strict: false });
        } catch (e) {
            throw new Error(
                `ConsoleService not found: import ConsoleModule in the module "${this.options.module?.name}" (${e.message})`,
                { cause: e }
            );
        }
        this.service.setContainer(this.container);
        this.configureCli();
        if (this.options.useDecorators) {
            await this.useDecorators();
        }
        if (this.options.completion) {
            registerCompletion(this.service, this.options.completion === true ? {} : this.options.completion);
        }
        return this.container;
    }

    /**
     * Get the console service
     */
    getService(): ConsoleService {
        return this.service;
    }

    /**
     * Get the options
     */
    getOptions(): O {
        return this.options;
    }

    /**
     * Boot the console
     * @param argv The list of arguments to pass to the cli, default are process.argv
     * @param parseOptions The commander parse options, eg `{ from: 'user' }` when argv only contains the user arguments
     */
    boot(argv: readonly string[] = process.argv, parseOptions?: commander.ParseOptions): Promise<CommandResponse> {
        if (!this.service) {
            return Promise.reject(new Error('The console is not initialized, call init() before boot()'));
        }
        return parseOptions ? this.service.init(argv, parseOptions) : this.service.init(argv);
    }

    /**
     * Init the application, execute the command and close the application.
     *
     * Commander errors (unknown command, missing argument...) are already printed by commander,
     * other errors are printed to stderr, and `process.exitCode` is set (commander's exit code, or 1).
     * The process is not killed, so the application can close its resources (onModuleDestroy...).
     *
     * @param argv The list of arguments to pass to the cli, default are process.argv
     * @param parseOptions The commander parse options, eg `{ from: 'user' }` when argv only contains the user arguments
     * @returns The response of the command, or undefined if it failed
     */
    async run(
        argv: readonly string[] = process.argv,
        parseOptions?: commander.ParseOptions
    ): Promise<CommandResponse | undefined> {
        const app = await this.init();
        const cli = this.service.getRootCli();
        cli.exitOverride();
        try {
            await app.init();
            return await this.boot(argv, parseOptions);
        } catch (e) {
            if (e instanceof commander.CommanderError) {
                process.exitCode = e.exitCode;
            } else {
                // commander always defines writeErr (process.stderr by default)
                const { writeErr } = cli.configureOutput() as Required<commander.OutputConfiguration>;
                writeErr(`${e instanceof Error ? (e.stack ?? e.message) : String(e)}\n`);
                process.exitCode = 1;
            }
            return undefined;
        } finally {
            await app.close();
        }
    }

    /**
     * An abstract method to create the nest application instance.
     * Could return any kind of NestApplication (headless or not)
     */
    abstract create(): Promise<A>;
}
