import { INestApplicationContext } from '@nestjs/common';
import { ContextIdFactory } from '@nestjs/core';

import { COMMAND_METADATA_NAME, CONSOLE_METADATA_NAME } from './constants';
import { ConsoleOptions, CreateCommandOptions } from './decorators';

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
    metadata: ConsoleOptions;
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
        for (const m of modules) {
            for (const [i, p] of m._providers) {
                const { metatype, name } = p;
                if (typeof metatype !== 'function') {
                    continue;
                }

                // ignore providers without instance
                if (!p.instance) {
                    continue;
                }

                const consoleMetadata: ConsoleOptions = Reflect.getMetadata(
                    CONSOLE_METADATA_NAME,
                    p.instance.constructor
                );

                // ignore providers without the console decorator
                if (!consoleMetadata) {
                    continue;
                }

                let instance;
                if (consoleMetadata.request) {
                    const contextId = ContextIdFactory.create();
                    app.registerRequestByContextId(consoleMetadata.request, contextId);
                    instance = await app.resolve(name, contextId);
                } else {
                    instance = app.get(name);
                }

                // get the provider instance from the container
                // const instance = app.get(name);
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
                // });
                // });
            }
        }

        return set;
    }
}
