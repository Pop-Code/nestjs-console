import { ConsoleModuleTestWithDecorators } from './module.decorators';
import { Test } from '@nestjs/testing';
import { ConsoleModule } from '../module';
import { ConsoleScanner } from '../scanner';
import { ConsoleModuleTest } from './module';
import { ConsoleServiceTest } from './service';

it('Should scan a nest application and returns empty response', async () => {
    const mod = await Test.createTestingModule({
        imports: [ConsoleModule]
    }).compile();

    const scanner = new ConsoleScanner();
    const scanResponse = scanner.scan(mod, [ConsoleModuleTest]);

    expect(scanResponse).toBeInstanceOf(Set);
    expect(scanResponse.size).toBe(0);
});

it('Should scan a nest application and find an instance with decorated methods', async () => {
    const mod = await Test.createTestingModule({
        imports: [ConsoleModule, ConsoleModuleTestWithDecorators]
    }).compile();

    const scanner = new ConsoleScanner();
    const scanResponse = scanner.scan(mod, [ConsoleModuleTestWithDecorators]);

    expect(scanResponse).toBeInstanceOf(Set);

    const { value } = scanResponse.values().next();
    expect(value.instance).toBeInstanceOf(ConsoleServiceTest);
    expect(value.methods).toHaveLength(1);
    expect(value.methods[0]).toHaveProperty('name');
    expect(value.methods[0].name).toBe('myCommand');
    expect(value.methods[0]).toHaveProperty('metadata');
    expect(value.methods[0].metadata).toHaveProperty('command');
});
