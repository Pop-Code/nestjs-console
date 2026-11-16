import * as nestConstants from '@nestjs/common/constants';
import { RouteParamtypes } from '@nestjs/common/enums/route-paramtypes.enum';

import {
    ConsoleParamType,
    EXCEPTION_FILTERS_METADATA,
    GUARDS_METADATA,
    INTERCEPTORS_METADATA,
    PIPES_METADATA,
    ROUTE_ARGS_METADATA
} from '../src/constants.js';

// nestjs-console copies these values to only import the public entry points of NestJS
describe('NestJS constants', () => {
    it('uses the metadata keys of NestJS', () => {
        expect(ROUTE_ARGS_METADATA).toBe(nestConstants.ROUTE_ARGS_METADATA);
        expect(GUARDS_METADATA).toBe(nestConstants.GUARDS_METADATA);
        expect(INTERCEPTORS_METADATA).toBe(nestConstants.INTERCEPTORS_METADATA);
        expect(PIPES_METADATA).toBe(nestConstants.PIPES_METADATA);
        expect(EXCEPTION_FILTERS_METADATA).toBe(nestConstants.EXCEPTION_FILTERS_METADATA);
    });

    it('uses the route param types of NestJS', () => {
        expect(ConsoleParamType.ARGUMENT).toBe(RouteParamtypes.PARAM);
        expect(ConsoleParamType.OPTION).toBe(RouteParamtypes.QUERY);
    });
});
