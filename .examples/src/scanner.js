import { DiscoveryService, ModulesContainer } from '@nestjs/core';
import { COMMAND_METADATA_NAME, CONSOLE_METADATA_NAME } from './constants.js';
export class ConsoleScanner {
    getInstanceMethods(instance) {
        const names = new Set(Object.getOwnPropertyNames(instance));
        let proto = Object.getPrototypeOf(instance);
        while (proto && proto !== Object.prototype) {
            for (const name of Object.getOwnPropertyNames(proto)) {
                names.add(name);
            }
            proto = Object.getPrototypeOf(proto);
        }
        return [...names].filter((m) => m !== 'constructor' && Reflect.hasMetadata(COMMAND_METADATA_NAME, instance, m));
    }
    async scan(app, includedModules) {
        const set = new Set();
        const discovery = new DiscoveryService(app.get(ModulesContainer, { strict: false }));
        const providers = discovery.getProviders(includedModules?.length ? { include: includedModules } : undefined);
        for (const wrapper of providers) {
            const { metatype, token, instance: wrapperInstance } = wrapper;
            if (typeof metatype !== 'function') {
                continue;
            }
            if (!wrapperInstance) {
                continue;
            }
            const consoleMetadata = Reflect.getMetadata(CONSOLE_METADATA_NAME, wrapperInstance.constructor);
            if (!consoleMetadata) {
                continue;
            }
            const instance = await app.resolve(token, undefined, {
                strict: false
            });
            const methods = this.getInstanceMethods(instance);
            set.add({
                instance,
                metadata: consoleMetadata,
                methods: methods.map((name) => ({
                    name,
                    metadata: Reflect.getMetadata(COMMAND_METADATA_NAME, instance, name)
                }))
            });
        }
        return set;
    }
}
