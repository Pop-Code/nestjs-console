/**
 * @module ConsoleScanner
 */
import { INestApplicationContext } from '@nestjs/common';

import { COMMAND_METADATA_NAME, CONSOLE_METADATA_NAME } from './constants';
import { CreateCommandOptions } from './decorators';
import { ModuleRef } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Injectable } from '@nestjs/common/interfaces';

/**
 * The interface for command method metadata
 */
export interface MethodsMetadata {
    name: string;
    metadata: CreateCommandOptions;
}

/**
 * The response of the scanner
 */
export interface ScanResponse {
    instance: any;
    metadata: CreateCommandOptions;
    methods: MethodsMetadata[];
}

export class ConsoleScanner {
    /**
     * Get all the modules
     */
    private getModules(modulesContainer: Map<any, any>, include: any[] = []): any[] {
        const allModules = [...modulesContainer.values()];
        if (!include.length) {
            return allModules;
        }
        return allModules.filter(({ metatype }) => include.some((item) => item === metatype));
    }

    /**
     * Get a list of classes methods
     */
    private getInstanceMethods(instance: any): string[] {
        return Object.getOwnPropertyNames(instance)
            .concat(Object.getOwnPropertyNames(instance.__proto__))
            .filter((m) => Reflect.hasMetadata(COMMAND_METADATA_NAME, instance, m));
    }

    /**
     * Scan an application
     * @param app
     * @param includedModules
     */
    public async scan(app: INestApplicationContext, includedModules?: any[]): Promise<Set<ScanResponse>> {
        const set = new Set<ScanResponse>();
        const { container } = app as any;
        const modules = this.getModules(container.getModules(), includedModules);

        await Promise.all(
            modules.map((m) => {
                return Promise.all(
                    Array.from<InstanceWrapper<Injectable>>(m._providers.values()).map(async (p) => {
                        const { metatype, token } = p;
                        if (typeof metatype !== 'function') {
                            return;
                        }

                        // ignore providers without instance
                        if (!p.instance) {
                            return;
                        }

                        const consoleMetadata: CreateCommandOptions = Reflect.getMetadata(
                            CONSOLE_METADATA_NAME,
                            // @ts-ignore
                            p.instance.constructor
                        );

                        // ignore providers without the console decorator
                        if (!consoleMetadata) {
                            return;
                        }

                        // get the provider instance from the container
                        const instance = await app.resolve(token, undefined, {
                            strict: false
                        });
                        const methods = this.getInstanceMethods(instance);

                        // get the metadata of the methods
                        const methodsMetadata = methods.map<MethodsMetadata>((methodMetadata) => ({
                            name: methodMetadata,
                            metadata: Reflect.getMetadata(COMMAND_METADATA_NAME, instance, methodMetadata)
                        }));

                        set.add({
                            instance,
                            metadata: consoleMetadata,
                            methods: methodsMetadata
                        });
                    })
                );
            })
        );

        return set;
    }
}
