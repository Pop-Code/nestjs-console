import { INestApplicationContext } from '@nestjs/common';
import { NestApplicationContextOptions } from '@nestjs/common/interfaces/nest-application-context-options.interface';

import { CommandResponse } from '../interfaces';
import { ConsoleModule } from '../module';
import { ConsoleService } from '../service';

/**
 * The Common options of the AbstractBootstrapConsole
 */
export interface CommonBootstrapConsoleOptions {
    /**
     * Any static module to load.
     * If you are using a dynamic module as a root module, you must create a module that imports your dynamic module first.
     * "@Module({imports: [MyDynamicModule.register()]})"
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    module: any;

    /**
     * If true the ConsoleService will hold an instance of the application.
     * This is true if useDecorators is true.
     */
    withContainer?: boolean;

    /**
     * If true the BootstrapConsole will scan the application to find Console and Command decorators
     */
    useDecorators?: boolean;

    /**
     * An optional list of Nest Modules to scan. If set, only listed modules will be scanned.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    includeModules?: any[];

    /**
     * The nest application context options
     */
    contextOptions?: NestApplicationContextOptions;
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
        const consoleModule = this.container.get(ConsoleModule);
        await consoleModule.scan(this.container, this.options.includeModules);
        return this;
    }

    /**
     * Init the console application
     */
    async init(): Promise<A> {
        this.container = await this.create();
        this.service = this.container.get(ConsoleService);
        if (
            (this.options.withContainer || this.options.useDecorators) &&
            typeof this.service.setContainer === 'function'
        ) {
            this.service.setContainer(this.container);
        }
        if (this.options.useDecorators) {
            await this.useDecorators();
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
     */
    boot(argv: string[] = process.argv): Promise<CommandResponse> {
        return this.service.init(argv);
    }

    /**
     * An abstract method to create the nest application instance.
     * Could return any kind of NestApplication (headless or not)
     */
    abstract create(): Promise<A>;
}
