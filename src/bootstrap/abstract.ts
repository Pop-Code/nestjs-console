import { INestApplicationContext } from '@nestjs/common';
import { ConsoleModule } from '../module';
import { ConsoleService } from '../service';

/**
 * The Common options of the AbstractBootstrapConsole
 */
export interface CommonBootstrapConsoleOptions {
    module: any;
    withContainer?: boolean;
    useDecorators?: boolean;
    contextOptions?: any;
}

/**
 * An abstract class to boot a nest application
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

    constructor(protected readonly options: O) {
        if (!this.options.contextOptions) {
            this.options.contextOptions = {
                logger: false
            };
        }
    }

    /**
     * Activate the decorators scanner
     */
    protected useDecorators() {
        const consoleModule = this.container.get(ConsoleModule);
        consoleModule.scan(this.container, [this.options.module]);
        return this;
    }

    /**
     * Init the console application
     */
    async init() {
        this.container = await this.create();
        this.service = this.container.get(ConsoleService);
        if (
            this.options.withContainer &&
            typeof this.service.setContainer === 'function'
        ) {
            this.service.setContainer(this.container);
        }
        if (this.options.useDecorators) {
            this.useDecorators();
        }
        return this.container;
    }

    /**
     * Get the console service
     */
    getService() {
        return this.service;
    }

    /**
     * Boot the console
     * @param argv The list of arguments to pass to the cli, default are process.argv
     */
    boot(argv?: string[], displayErrors: boolean = true) {
        /* istanbul ignore next */
        const args = argv || process.argv;
        return this.service.init(args, displayErrors);
    }

    /**
     * An abstract method to create the nest application instance.
     * Could return any kind of NestApplication (headless or not)
     */
    abstract create(): Promise<A>;
}
