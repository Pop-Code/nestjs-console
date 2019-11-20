import { NestApplicationOptions } from '@nestjs/common';
import {
    AbstractHttpAdapter,
    NestApplication,
    NestFactory
} from '@nestjs/core';
import { AbstractBootstrapConsole } from './abstract';
import { BootstrapConsoleOptions } from './console';

/**
 * The options of the BootstrapConsoleServer
 */
export interface BootstrapConsoleServerOptions extends BootstrapConsoleOptions {
    contextOptions?: NestApplicationOptions;
    httpAdapter?: AbstractHttpAdapter;
}

/**
 * A class to boot a nestjs application from cli
 */
export class BootstrapConsoleServer extends AbstractBootstrapConsole<
    NestApplication,
    BootstrapConsoleServerOptions
> {
    create(): Promise<NestApplication> {
        if (this.options.httpAdapter) {
            return NestFactory.create(
                this.options.module,
                this.options.httpAdapter,
                this.options.contextOptions
            );
        }
        return NestFactory.create(
            this.options.module,
            this.options.contextOptions
        );
    }
}
