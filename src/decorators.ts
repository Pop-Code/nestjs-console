import { Inject } from '@nestjs/common';
import { COMMANDER_SERVICE_TOKEN } from './constants';

export const InjectCommander = () => {
    return Inject(COMMANDER_SERVICE_TOKEN);
};
