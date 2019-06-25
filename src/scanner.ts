import { isEmpty } from 'lodash';
import { CONSOLE_METADATA_NAME, COMMAND_METADATA_NAME } from './constants';
import { IScanResponse, IConsoleOptions, IMethodsMetadata } from './interfaces';

export class ConsoleScanner {
    private getModules(
        modulesContainer: Map<any, any>,
        include: Function[]
    ): any[] {
        const allModules = [...modulesContainer.values()];
        if (!include || isEmpty(include)) {
            return allModules;
        }
        return allModules.filter(({ metatype }) =>
            include.some(item => item === metatype)
        );
    }

    private getInstanceMethods(instance: any) {
        return Object.getOwnPropertyNames(instance)
            .concat(Object.getOwnPropertyNames(instance.__proto__))
            .filter(m =>
                Reflect.hasMetadata(COMMAND_METADATA_NAME, instance, m)
            );
    }

    public scan(app, includedModules?: Function[]): Set<IScanResponse> {
        const set = new Set<IScanResponse>();
        const { container } = app;
        const modules = this.getModules(
            container.getModules(),
            includedModules
        );
        modules.forEach(m => {
            m._providers.forEach(p => {
                const { metatype, name } = p;
                if (typeof metatype !== 'function') return;

                const consoleMetadata: IConsoleOptions = Reflect.getMetadata(
                    CONSOLE_METADATA_NAME,
                    metatype
                );

                // ignore providers without the console decorator
                if (!consoleMetadata) {
                    return;
                }

                // get the provider instance from the container
                const instance = app.get(name);
                const methods = this.getInstanceMethods(instance);

                // get the metadata of the methods
                const methodsMetadata = methods.map<IMethodsMetadata>(m => ({
                    name: m,
                    metadata: Reflect.getMetadata(
                        COMMAND_METADATA_NAME,
                        instance,
                        m
                    )
                }));

                set.add({
                    instance,
                    metadata: consoleMetadata,
                    methods: methodsMetadata
                });
            });
        });

        return set;
    }
}
