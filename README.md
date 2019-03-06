# nestjs-console

[NestJS Console][doc-link] is a module that provide a cli. A ready to use service class for your module that exposes the required methods to register commands and sub commands using the [npm package commander][commander-link]

### Install

```bash
npm install nestjs-console
# or unig yarn
yarn install nestjs-console
```

### Prepare the cli endpoint

Create a file next to main.ts named console.ts  
Import your app module or any module you want to be loaded. Usually this is your main nestjs module.

```ts
// console.ts
import { bootstrap } from 'nestjs-console';
import { MyAppModule } from './my.application.module';

bootstrap(MyAppModule, { logger: false }).catch(e => console.log('Error', e));
```

### Usage

An example of nestjs module that import the ConsoleModule

```ts
// module.ts
import { Module } from '@nestjs/common';
import { ConsoleModule } from 'nestjs-console';
import { MyService } from './service';

@Module({
    imports: [
        ConsoleModule
    ],
    providers: [MyService]
    exports: [MyService]
})
export class MyModule {}
```

You can now inject the ConsoleService inside any nestjs providers, controllers...

```ts
// service.ts
import { Injectable } from '@nestjs/common';
import { ConsoleService } from 'nestjs-console';

@Injectable()
export class MyService {
    constructor(private readonly consoleService: ConsoleService) {
        this.consoleService
            .getCli()
            .command('mycommand')
            .options('-a, --all', 'an exemple of options')
            .action(this.myCommand.bind(this));
    }

    myCommand(options) {
        //See Ora npm package for details about spinner
        const spin = this.consoleService.createSpinner();
        spin.start();
        // DO SOME WORK
        spin.stop();
    }
}
```

### Documentation

A typedoc is generated and available on github [https://pop-code.github.io/nestjs-console][doc-link]

[doc-link]: https://pop-code.github.io/nestjs-console
[commander-link]: https://www.npmjs.com/package/commander
