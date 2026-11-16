import { NestFactory } from '@nestjs/core';
import { AbstractBootstrapConsole } from './abstract.js';
export class BootstrapConsole extends AbstractBootstrapConsole {
    create() {
        return NestFactory.createApplicationContext(this.options.module, this.options.contextOptions);
    }
}
