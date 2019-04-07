# nestjs-console

[NestJS Console][doc-link] is a module that provide a cli. A ready to use service class for your module that exposes the required methods to register commands and sub commands using the [npm package commander][commander-link]

### [Install FROM NPM][npm]

```bash
npm install nestjs-console
# or unig yarn
yarn install nestjs-console
```

### Prepare the cli endpoint

Create a file at root next to your entry point named console.ts  
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
        //You can create single commands
        this.consoleService
            .getCli()
            .command('mycommand <value>')
            .description(
                'Do something'
            )
            .options('-a, --all', 'an example of options')
            .action(this.myCommand.bind(this));

        //You can also create nested command
        const parentCommand = this.consoleService
            .getCli()
            .command('mygroupcommands')
            .description(
                'Manage a group of subcommand'
            ) as PatchedCommander).forwardSubcommands();

        parentCommand.command('nestedcommand <value>').action(value => {
            console.log('Recevied value', value);
        });
    }

    myCommand(options) {
        //See Ora npm package for details about spinner
        const spin = this.consoleService.createSpinner();
        spin.start();
        // DO SOME WORK
        console.log(options.all);
        spin.stop();
    }
}
```

Add scripts in your package.json (Only if you want to use them)

```json
{
    "scripts": {
        "console:dev": "ts-node -r tsconfig-paths/register src/console.ts",
        "console": "node lib/console.js"
    }
}
```

Usage from cli (we suppose your app was built in the lib forlder)

```bash
# direct call
node lib/console.js --help

# using npm
npm run console -- --help

# using yarn
yarn run console --help

# during dev you can call the console using ts-node
yarn run console:dev --help
```

### Response

```
#example of response

Usage: console [options] [command]

Options:
  -h, --help           output usage information

Commands:
  mycommand <value>     Do something
  mygroupcommands       Manage a group of subcommand
```

### Documentation

A typedoc is generated and available on github [https://pop-code.github.io/nestjs-console][doc-link]

### [CHANGELOG][changelog]

[npm]: https://www.npmjs.com/package/nestjs-console
[doc-link]: https://pop-code.github.io/nestjs-console
[commander-link]: https://www.npmjs.com/package/commander
[changelog]: https://github.com/Pop-Code/nestjs-console/CHANGELOG.md
