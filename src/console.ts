import { ConsoleService } from './service';
import { NestApplicationContextOptions } from '@nestjs/common/interfaces/nest-application-context-options.interface';
import { NestFactory } from '@nestjs/core';
import ora from 'ora';

export interface ConsoleOptions {
    module: any;
    contextOptions: NestApplicationContextOptions;
    service?: { new (...args: any[]): ConsoleService };
}

export const bootstrap = async (options: ConsoleOptions) => {
    const spinner = ora('Init');
    spinner.start();
    if (!options.service) {
        options.service = ConsoleService;
    }
    const app = await NestFactory.createApplicationContext(
        options.module,
        options.contextOptions
    );
    const consoleService = app.get(options.service);
    spinner.stop();
    consoleService.init(process.argv);
};
