import { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AbstractBootstrapConsole, CommonBootstrapConsoleOptions } from './abstract';

/**
 * A class to boot a nestjs application context from cli
 */
export class BootstrapConsole extends AbstractBootstrapConsole<INestApplicationContext, CommonBootstrapConsoleOptions> {
    create(): Promise<INestApplicationContext> {
        return NestFactory.createApplicationContext(this.options.module, this.options.contextOptions);
    }
}
