import { INestApplicationContext } from '@nestjs/common';
import { NestApplicationContextOptions } from '@nestjs/common/interfaces/nest-application-context-options.interface';
import { NestFactory } from '@nestjs/core';
import {
    AbstractBootstrapConsole,
    CommonBootstrapConsoleOptions
} from './abstract';

/**
 * The options of the BootstrapConsoleOptions
 */
export interface BootstrapConsoleOptions
    extends CommonBootstrapConsoleOptions {}

/**
 * A class to boot a nestjs application context from cli
 */
export class BootstrapConsole extends AbstractBootstrapConsole<
    INestApplicationContext,
    BootstrapConsoleOptions
> {
    create(): Promise<INestApplicationContext> {
        return NestFactory.createApplicationContext(
            this.options.module,
            this.options.contextOptions
        );
    }
}
