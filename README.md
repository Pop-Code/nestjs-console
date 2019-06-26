[![nestjs-console](https://raw.githubusercontent.com/Pop-Code/nestjs-console/master/resources/logo-frame.png)][npm]
[![CircleCI](https://circleci.com/gh/Pop-Code/nestjs-console.svg?style=shield)][ci]
[![codecov](https://codecov.io/gh/Pop-Code/nestjs-console/branch/master/graph/badge.svg)][codecov]
[![NPM Downloads](https://img.shields.io/npm/dm/nestjs-console.svg?style=flat)][npmchart]
[![npm](https://img.shields.io/node/v/carbon.svg?style=flat)][npm]

[nestjs-console][npm] is a module that provide a cli. A ready to use service class for your modules that exposes methods to register commands and sub commands using the [npm package commander][commander]

## Why

The nestjs framework is missing a cli to access the application context.  
Common use case : Headless application, cront task, export data, etc...
[nestjs-console][npm] provide a way to bind cli command and subcommands to providers's methods.

## How it works

The console service works as a standalone process, like the classic entry point, and will initialize a NestApplicationContext (headless) instead a NestApplication.
The console service will be accesible inside the container.

1. Bootstrap (entry point e.g console.ts) is invoked by cli.
2. Init a headless nest app
    - Any module inside the app can create command and subcommands using nestjs-console with [commander][commander]
3. nestjs-console invoke commander
4. commander will do the rest.

## [Install FROM NPM][npm]

```bash
npm install nestjs-console
# or unig yarn
yarn add nestjs-console
```

## Create a cli endpoint

Create a file at root next to your entry point named console.ts  
Import your app module or any module you want to be loaded. Usually this is your main nestjs module.
You can create as many entry points as you want.
You can also extend the `BootstrapConsole` class to suit your needs.

```ts
// console.ts - example of entrypoint
import { BootstrapConsole } from 'nestjs-console';
import { MyModule } from './module';

BootstrapConsole.init({ module: MyModule })
    .then(({ app, boot }) => {
        // do something with your app container if you need (app)
        // boot the cli
        boot(/*process.argv*/);
    })
    .catch(e => console.log('Error', e));
```

## Import the ConsoleModule in your main module

```ts
// module.ts - your module
import { Module } from '@nestjs/common';
import { ConsoleModule } from 'nestjs-console';
import { MyService } from './service';

@Module({
    imports: [
        ConsoleModule // import the ConsoleModule
    ],
    providers: [MyService]
    exports: [MyService]
})
export class MyModule {}
```

You can now inject the _ConsoleService_ inside any nestjs providers, controllers...

There are 2 ways of registering providers methods to the console.  
Using decorators (>=v1.1) or using the _ConsoleService_.

At the moment, it's not possible to have more than 2 dimensions in the commands stack using decorators.

Example of possible cli stack Using decorator

```
Cli -> Command_A -> [
        Command_A1 -> execution,
        Command_A2 -> execution
    ]
    -> Command_B -> [
        Command_B1 -> execution,
        Command_B2 -> execution
    ]
    -> Command_C -> execution
```

Example of possible cli stack using the ConsoleService (More flexible, Multi dimensions)

```
Cli -> Command_A -> [
        Command_A1 -> execution,
        Command_A2 -> execution
    ]
    -> Command_B -> [
        Command_B1 -> execution,
        Command_B2 -> [
            Command_B2_a -> execution
            Command_B2_b -> [... more sub commands ...]
        ]
    ]
    -> Command_C -> execution
```

# Api

As an example, we will define a cli with 2 commands (new and list), one of the command (new) will have 2 sub commands (directory and file)

```
Cli -> list -> -> execution,
    -> new -> [
        directory -> execution,
        file -> execution
    ]
```

## How to use Decorators

Registering methods using class decorators is very easy.
Each nestjs providers that are decorated with @Console will be scanned and each member methods that are decorated with @Command will be registered on the cli.

```ts
// service.ts - a nestjs provider using console decorators
import { Console, Command } from 'nestjs-console';

@Console()
export class MyService {
    @Command({
        command: 'list <directory>',
        description: 'List content of a directory'
    })
    async listContent(directory: string): void | Promise<void> {
        // See Ora npm package for details about spinner
        const spin = this.consoleService.createSpinner();
        spin.start(`Listing files in directory ${directory}`);

        // simulate a long task of 1 seconds
        const files = await new Promise(done =>
            setTimeout(() => {
                done(['fileA', 'fileB']);
            }, 1000)
        );

        spin.succeed('Listing done');

        // send the response to the  cli
        // you could also use process.stdout.write()
        console.log(JSON.stringify(files));

        process.exit(0);
    }
}
```

#### Register a command with sub commands

By default, the @Console will tell the module to register all decorated methods at root of the cli.  
`Example of Usage: [options] [command]`

You can name your provider to use it as a parent command container.
This is usefull when you have a lot of commands and you want to group them as sub command. (git style)

To achieve this, you have to group your methods into class, you can pass options to the @Console decorator to configure your provider as a parent command.
Each decorated methods of the providers will be registered as a sub command of the provider instead of beeing registered at root.

```ts
// service.new.ts - a nestjs provider using console decorators (sub commands)
@Console({
    name: 'new',
    description: 'A command to create an item'
})
export class MyNewService {
    @Command({
        command: 'file <name>',
        description: 'Create a file'
    })
    async createFile(name: string): void | Promise<void> {
        console.log(`Creating a file named ${name}`);
        // your code...
        process.exit(0); // it's important to exit the process.
    }

    @Command({
        command: 'directory <name>',
        description: 'Create a directory'
    })
    async createDirectory(name: string): void | Promise<void> {
        console.log(`Creating a directory named ${name}`);
        // your code...
        process.exit(0); // it's important to exit the process.
    }
}
```

`Example of Usage: new [options] [command]`

## How to use the ConsoleService

Registering methods using the ConsoleService is more flexible than decorators.  
When you use the ConsoleService, you simply bind your methods to the cli manually.  
This is usefull if you need to create the cli or a part of the cli at runtime, depending on others providers values , you could bind or not specific methods.  
This way you can also create mutliple commands ans sub commands from the same class.

```ts
// service.ts - a nestjs provider
import { Injectable } from '@nestjs/common';
import { ConsoleService } from 'nestjs-console';

@Injectable()
export class MyService {
    constructor(private readonly consoleService: ConsoleService) {
        this.listContent = this.listContent.bind(this);
        this.createFile = this.createFile.bind(this);
        this.createDirectory = this.createDirectory.bind(this);

        // get the root cli
        const cli = this.consoleService.getCli();

        // create a single command (See [npm commander for more details])
        cli.command('list <directory>')
            .description('List content of a directory')
            .action(this.listContent);

        // create a parent command container
        const parentCommand = this.consoleService.subCommands(
            cli,
            'new',
            'A command to create an item'
        );

        // create sub command
        parentCommand
            .command('file <name>')
            .description('Create a file')
            .action(this.createFile);

        // create an other sub command
        parentCommand
            .command('directory <name>')
            .description('Create a directory')
            .action(this.createDirectory);
    }

    async listContent(directory: string): void | Promise<void> {
        console.log(`Listing files in directory ${directory}`);
        // your code...
        process.exit(0); // it's important to exit the process.
    }

    async createFile(name: string): void | Promise<void> {
        console.log(`Creating a file named ${name}`);
        process.exit(0); // it's important to exit the process.
    }

    async createDirectory(name: string): void | Promise<void> {
        console.log(`Creating a directory named ${name}`);
        // your code...
        process.exit(0); // it's important to exit the process.
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

#### Example of Response

```
Usage: console [options] [command]

Options:
  -h, --help            output usage information

Commands:
  list <directory>      List content of a directory
  new                   A command to create an item
```

### Create a Custom ConsoleService

You can create any number of custom ConsoleService and any nummber of entrypoints (BootstrapConsole).
The Commander provider can be injected using the decorators `@InjectCommander()`.
The decorator can be imported from nestjs-console `import { InjectCommander } from 'nestjs-console';

```ts
import { Injectable } from '@nestjs/common';
import { InjectCommander, Command, ConsoleService } from 'nestjs-console';

@Injectable()
export class CustomConsole extends ConsoleService {
    constructor(@InjectCommander() protected readonly cli: Command) {
        super(cli);
        this.cli.version('1.0.1', '-v, --version');
    }
}
```

### [API DOCUMENTATION][doclink]

### [CHANGELOG][changelog]

[npm]: https://www.npmjs.com/package/nestjs-console
[npmchart]: https://npmcharts.com/compare/nestjs-console?minimal=true
[ci]: https://circleci.com/gh/Pop-Code/nestjs-console
[codecov]: https://codecov.io/gh/Pop-Code/nestjs-console
[doclink]: https://pop-code.github.io/nestjs-console
[commander]: https://www.npmjs.com/package/commander
[changelog]: https://github.com/Pop-Code/nestjs-console/blob/master/CHANGELOG.md
