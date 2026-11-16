import * as commander from 'commander';
import { registerCompletion } from '../completion.js';
import { ConsoleModule } from '../module.js';
import { ConsoleService } from '../service.js';
export class AbstractBootstrapConsole {
    constructor(options) {
        this.options = options;
        if (!this.options.contextOptions) {
            this.options.contextOptions = {};
        }
        if (!this.options.contextOptions.logger) {
            this.options.contextOptions.logger = ['error'];
        }
    }
    async useDecorators() {
        const consoleModule = this.container.get(ConsoleModule, { strict: false });
        await consoleModule.scan(this.container, this.options.includeModules);
        return this;
    }
    configureCli() {
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
    async init() {
        this.container = await this.create();
        try {
            this.service = this.container.get(ConsoleService, { strict: false });
        }
        catch (e) {
            throw new Error(`ConsoleService not found: import ConsoleModule in the module "${this.options.module?.name}" (${e.message})`, { cause: e });
        }
        this.service.setContainer(this.container);
        if (this.options.prompt) {
            this.service.getPrompt().configure(this.options.prompt);
        }
        this.configureCli();
        if (this.options.useDecorators) {
            await this.useDecorators();
        }
        if (this.options.completion) {
            registerCompletion(this.service, this.options.completion === true ? {} : this.options.completion);
        }
        return this.container;
    }
    getService() {
        return this.service;
    }
    getOptions() {
        return this.options;
    }
    boot(argv = process.argv, parseOptions) {
        if (!this.service) {
            return Promise.reject(new Error('The console is not initialized, call init() before boot()'));
        }
        return parseOptions ? this.service.init(argv, parseOptions) : this.service.init(argv);
    }
    async run(argv = process.argv, parseOptions) {
        const app = await this.init();
        const cli = this.service.getRootCli();
        cli.exitOverride();
        try {
            await app.init();
            return await this.boot(argv, parseOptions);
        }
        catch (e) {
            if (e instanceof commander.CommanderError) {
                process.exitCode = e.exitCode;
            }
            else {
                const { writeErr } = cli.configureOutput();
                writeErr(`${e instanceof Error ? (e.stack ?? e.message) : String(e)}\n`);
                process.exitCode = 1;
            }
            return undefined;
        }
        finally {
            await app.close();
        }
    }
}
