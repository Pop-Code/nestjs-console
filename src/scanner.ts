/**
 * @module ConsoleScanner
 */
import { INestApplicationContext } from '@nestjs/common';
import { DiscoveryService, ModulesContainer } from '@nestjs/core';

import { COMMAND_METADATA_NAME, CONSOLE_METADATA_NAME } from './constants';
import { CreateCommandOptions } from './decorators';

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
     * Get the names of the methods decorated with "@Command", including the ones inherited from parent classes
     */
    private getInstanceMethods(instance: any): string[] {
        const names = new Set<string>(Object.getOwnPropertyNames(instance));
        let proto = Object.getPrototypeOf(instance);
        while (proto && proto !== Object.prototype) {
            for (const name of Object.getOwnPropertyNames(proto)) {
                names.add(name);
            }
            proto = Object.getPrototypeOf(proto);
        }
        return [...names].filter((m) => m !== 'constructor' && Reflect.hasMetadata(COMMAND_METADATA_NAME, instance, m));
    }

    /**
     * Scan an application
     * @param app
     * @param includedModules Only scan the providers of these modules
     */
    public async scan(app: INestApplicationContext, includedModules?: any[]): Promise<Set<ScanResponse>> {
        const set = new Set<ScanResponse>();
        const discovery = new DiscoveryService(app.get(ModulesContainer, { strict: false }));
        const providers = discovery.getProviders(includedModules?.length ? { include: includedModules } : undefined);

        // resolve in order, so commands are registered in the order of the providers
        for (const wrapper of providers) {
            const { metatype, token, instance: wrapperInstance } = wrapper;
            if (typeof metatype !== 'function') {
                continue;
            }

            // ignore providers without instance
            if (!wrapperInstance) {
                continue;
            }

            const consoleMetadata: CreateCommandOptions = Reflect.getMetadata(
                CONSOLE_METADATA_NAME,
                wrapperInstance.constructor
            );

            // ignore providers without the console decorator
            if (!consoleMetadata) {
                continue;
            }

            // get the provider instance from the container
            const instance = await app.resolve(token, undefined, {
                strict: false
            });
            const methods = this.getInstanceMethods(instance);

            set.add({
                instance,
                metadata: consoleMetadata,
                methods: methods.map<MethodsMetadata>((name) => ({
                    name,
                    metadata: Reflect.getMetadata(COMMAND_METADATA_NAME, instance, name)
                }))
            });
        }

        return set;
    }
}
