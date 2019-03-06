import { ConsoleService } from './service';
import { NestApplicationContextOptions } from '@nestjs/common/interfaces/nest-application-context-options.interface';
import { NestFactory } from '@nestjs/core';
import ora from 'ora';

export async function bootstrap(
    appModule: any,
    options: NestApplicationContextOptions
) {
    const spinner = ora('Init');
    spinner.start();

    const app = await NestFactory.createApplicationContext(appModule, options);
    const consoleService = app.get(ConsoleService);

    spinner.stop();

    consoleService.init(process.argv);
}
