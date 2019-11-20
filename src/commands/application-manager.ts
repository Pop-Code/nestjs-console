import { Injectable } from '@nestjs/common';
import { NestApplication } from '@nestjs/core/nest-application';
import { Command as CommandDecorator, Console } from '../decorators';
import { createSpinner } from '../helpers';
import { ConsoleService } from '../service';
import { Command } from 'commander';

/**
 * The ApplicationManager is a class binded to a command that can start a the app server
 */
@Console()
@Injectable()
export class ApplicationManager {
    constructor(private consoleService: ConsoleService) {}

    protected checkContainerInterface(container: any): NestApplication {
        if (!(container instanceof NestApplication)) {
            throw new Error(
                'The ApplicationManager can not start an instance that does is not a NestApplication'
            );
        }
        return container;
    }

    /**
     * Start the application http server
     */
    @CommandDecorator({
        command: 'start',
        description: 'Start the server',
        options: [
            {
                flags: '-p, --port <number>',
                description: 'The port to to listen',
                fn: parseFloat,
                defaultValue: 3000
            },
            {
                flags: '-q, --quiet',
                description: 'Do not log any informations',
                defaultValue: false
            },
            {
                flags: '-e, --throwError',
                description: 'Do not catch errors',
                defaultValue: false
            }
        ]
    })
    async start(command: Command) {
        const spinner = createSpinner({ text: 'Server starting...' });
        try {
            if (!command.quiet) {
                spinner.start();
            }

            const container = this.consoleService.getContainer() as NestApplication;
            this.checkContainerInterface(container);

            await container.listen(command.port);

            if (!command.quiet) {
                spinner.succeed(`Server listening on port ${command.port}`);
            }
            return command;
        } catch (e) {
            if (!command.quiet && !command.trowError) {
                spinner.fail(e.message);
            } else if (!command.trowError) {
                throw e;
            }
        }
    }
}
