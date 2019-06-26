import { Inject } from '@nestjs/common';
import {
    COMMANDER_SERVICE_TOKEN,
    COMMAND_METADATA_NAME,
    CONSOLE_METADATA_NAME
} from './constants';
import { ICommandDecoratorOptions, IConsoleOptions } from './interfaces';

export const InjectCommander = () => {
    return Inject(COMMANDER_SERVICE_TOKEN);
};

export const Command = (options: ICommandDecoratorOptions) => {
    return (target: any, method: string | symbol) =>
        Reflect.defineMetadata(COMMAND_METADATA_NAME, options, target, method);
};

export const Console = (options?: IConsoleOptions) => (target: any) =>
    Reflect.defineMetadata(CONSOLE_METADATA_NAME, options || {}, target);
