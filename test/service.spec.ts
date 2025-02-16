import { Test, TestingModule } from '@nestjs/testing';
import { Command } from 'commander';

import { ConsoleModule } from '../src/module';
import { ConsoleService } from '../src/service';

let mod: TestingModule;
let service: ConsoleService;

beforeAll(async () => {
    mod = await Test.createTestingModule({
        imports: [ConsoleModule]
    }).compile();
});

beforeEach(() => {
    service = mod.get<ConsoleService>(ConsoleService);
});

describe('ConsoleService', () => {
    it('should set the container in the service and return the service', () => {
        expect(service.setContainer(mod)).toBeInstanceOf(ConsoleService);
    });

    it('should have a cli defined', () => {
        const cli = service.getCli();
        expect(cli).toBeDefined();
        expect(cli).toBeInstanceOf(Command);
    });

    it('should throw an error if command is not found', () => {
        const handler = ConsoleService.createHandler(() => {});
        expect(() => handler('test')).rejects.toThrow('Command not found');
    });
});
