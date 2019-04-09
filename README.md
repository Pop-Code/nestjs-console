# nestjs-console

[![NPM Downloads](https://img.shields.io/npm/dm/nestjs-console.svg?style=flat)](https://npmcharts.com/compare/nestjs-console?minimal=true)

[nestjs-console][npm] is a module that provide a cli. A ready to use service class for your modules that exposes methods to register commands and sub commands using the [npm package commander][commander]

## Why

The nestjs framework is missing a cli to access the application context.  
Common use case : Headless application, cront task, export data, etc...
[nestjs-console][npm] provide a way to bind cli command and subcommands to providers's methods.

## How it works

The console service works as a standalone process, like the classic entry point, and will initialize a NestApplicationContext (headless) instead a NestApplication.
The console service will be accesible inside the container.

1. Bootstrap (entry point e.g console.ts) invoked by cli.
2. Init a headless nest app
    - Any module inside the app can create command and subcommands using nestjs-console with [commander][commander]
3. nestjs-console invoke commander
4. commander will do the rest.

### [Install FROM NPM][npm]

```bash
npm install nestjs-console
# or unig yarn
yarn add nestjs-console
```

#### Create a cli endpoint

Create a file at root next to your entry point named console.ts  
Import your app module or any module you want to be loaded. Usually this is your main nestjs module.
You can create as many entry points as you want.

```ts
// console.ts
import { bootstrap } from 'nestjs-console';
import { MyAppModule } from './my.application.module';

bootstrap({ module: MyAppModule, contextOptions: { logger: false }).catch(e =>
    console.log('Error', e)
);
```

#### Import the module

```ts
// module.ts
import { Module } from '@nestjs/common';
import { ConsoleModule } from 'nestjs-console';
import { MyService } from './service';

@Module({
    imports: [
        ConsoleModule // import the console module
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
        // get the root cli
        const cli = this.consoleService.getCli();

        // e.g create a single command (See [npm commander for more details])
        cli.command('list <directory>')
            .description('List content of a directory')
            .action(this.myCommand.bind(this));

        // e.g create a parent command container
        const parentCommand = this.consoleService.subCommands(
            cli,
            'new',
            'A command to create an item'
        );

        // e.g create sub command
        parentCommand
            .command('file <name>')
            .description('Create a file')
            .action((name: string, path: string) => {
                console.log(`Creating a file named ${name} at path`);
                process.exit(0);
            });

        // e.g why not an other one ?
        parentCommand
            .command('directory <name>')
            .description('Create a directory')
            .action(() => {
                console.log(`Creating a direcotry named ${name}`);
                process.exit(0);
            });
    }

    list(directory: string): void | Promise<void> {
        // See Ora npm package for details about spinner
        const spin = this.consoleService.createSpinner();
        spin.start();
        console.log(`Listing files at path named ${directory}`);
        spin.stop();
        process.exit(0);
    }
}
```

Add scripts in your package.json (if you want to them)

```js
{
    "scripts": {
        // from sources
        "console:dev": "ts-node -r tsconfig-paths/register src/console.ts",
        // from build (we suppose your app was built in the lib forlder)
        "console": "node lib/console.js"
    }
}
```

## Usage

Call the cli (production)

```bash
# using node
node lib/console.js --help
# using npm
npm run console -- --help
# using yarn
yarn console --help
```

Call the cli from sources (dev)

```bash
# using ts-node
ts-node -r tsconfig-paths/register src/console.ts --help
# using npm
npm run console:dev -- --help
# using yarn
yarn console:dev --help
```

#### Response

```
Usage: console [options] [command]

Options:
  -h, --help            output usage information

Commands:
  list <dir>            List content of a directory
  new                   A command to create an item
```

### Create a Custom ConsoleService

You can create any number of custom ConsoleService as any nummber of entrypoints.
The Commander provider can be injected using the decorators `@InjectCommander()`.
The decorator can be imported from nestjs-console `import { InjectCommander } from 'nestjs-console';

Imagine we want to set the version of the cli for all commands

```ts
import { Injectable } from '@nestjs/common';
import {
    InjectCommander,
    PatchedCommander,
    ConsoleService
} from 'nestjs-console';

export class MyCustomCli extends ConsoleService {
    constructor(@InjectCommander() protected readonly cli: Command) {
        super(cli);
    }

    /**
     * My custom version
     */
    init() {
        // here we want to set a global version
        this.cli.version('1.0.1', '-v, --version');

        super.init();
    }
}
```

### [API DOCUMENTATION][doclink]

### [CHANGELOG][changelog]

[npm]: https://www.npmjs.com/package/nestjs-console
[doclink]: https://pop-code.github.io/nestjs-console
[commander]: https://www.npmjs.com/package/commander
[changelog]: https://github.com/Pop-Code/nestjs-console/blob/master/CHANGELOG.md
