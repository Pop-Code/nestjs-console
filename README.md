<div align="center">

[![nestjs-console](https://raw.githubusercontent.com/Pop-Code/nestjs-console/master/resources/logo-frame.png)][npm]
[![Actions Status](https://github.com/Pop-Code/nestjs-console/workflows/Test/badge.svg)](https://github.com/Pop-Code/nestjs-console/actions)
[![codecov](https://codecov.io/gh/Pop-Code/nestjs-console/branch/master/graph/badge.svg)][codecov]
[![NPM Downloads](https://img.shields.io/npm/dm/nestjs-console.svg?style=flat)][npmchart]
![node](https://img.shields.io/node/v/nestjs-console)
![npm (tag)](https://img.shields.io/npm/v/nestjs-console/latest)
![npm peer dependency version (scoped)](https://img.shields.io/npm/dependency-version/nestjs-console/peer/@nestjs/core)
![npm peer dependency version (scoped)](https://img.shields.io/npm/dependency-version/nestjs-console/peer/commander)

</div>

[nestjs-console][npm] is a module that provide a cli. A ready to use service class for your modules that exposes methods to register commands and sub commands using the [npm package commander][commander]

## Why

The nestjs framework is missing a cli to access the application context.  
Common use case : Headless application, cront task, export data, etc...
[nestjs-console][npm] provide a way to bind cli command and subcommands to providers's methods.

## How it works

The console service works as a standalone process, like the classic entry point, and will initialize a NestApplicationContext (headless) instead a NestApplication.
The console service will be accessible inside the container.

1. Bootstrap (entry point e.g console.ts) is invoked by cli.
2. Create a headless nest app
    - Any module inside the app can create command and subcommands using nestjs-console with [commander][commander]
3. nestjs-console invoke commander
4. commander will do the rest.

## [Install FROM NPM][npm]

```bash
npm install commander nestjs-console
# or unig yarn
yarn add commander nestjs-console
```

Note:
For commander <5.0.0, use nestjs-console@2.1.0
For commander >=5.0.0 (latest), use nestjs-console@^3.0.2

## Create a cli endpoint

Create a file at root next to your entry point named console.ts  
Import your app module or any module you want to be loaded. Usually this is your main nestjs module.

```ts
// console.ts - example of entrypoint
import { BootstrapConsole } from 'nestjs-console';
import { MyModule } from './module';

const bootstrap = new BootstrapConsole({
    module: MyModule,
    useDecorators: true
});
bootstrap.init().then(async (app) => {
    try {
        // init your app
        await app.init();
        // boot the cli
        await bootstrap.boot();

        // Use app.close() instead of process.exit() because app.close() will
        // trigger onModuleDestroy, beforeApplicationShutdown and onApplicationShutdown.
        // For example, in your command doing the database operation and need to close
        // when error or finish.
        await app.close();

        process.exit(0);
    } catch (e) {
        app.close();

        process.exit(1);
    }
});
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
    providers: [MyService],
    exports: [MyService]
})
export class MyModule {}
```

You can now inject the _ConsoleService_ inside any nestjs providers, controllers...

There are 2 ways of registering providers methods to the console.  
Using @decorators or using the _ConsoleService_.

Example of cli stack

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

As a simple example, we will define a cli with 2 commands (new and list), one of the command (new) will have 2 sub commands (directory and file)

```
Cli -> list -> -> execution,
    -> new -> [
        directory -> execution,
        file -> execution
    ]
```

## How to use Decorators

Registering methods using class decorators is very easy.
Nestjs providers that are decorated with @Console will be scanned and each member method that is decorated with @Command will be registered on the cli.

```ts
// service.ts - a nestjs provider using console decorators
import { Console, Command, createSpinner } from 'nestjs-console';

@Console()
export class MyService {
    @Command({
        command: 'list <directory>',
        description: 'List content of a directory'
    })
    async listContent(directory: string): Promise<void> {
        // See Ora npm package for details about spinner
        const spin = createSpinner();
        spin.start(`Listing files in directory ${directory}`);

        // simulate a long task of 1 seconds
        const files = await new Promise((done) => setTimeout(() => done(['fileA', 'fileB']), 1000));

        spin.succeed('Listing done');

        // send the response to the  cli
        // you could also use process.stdout.write()
        console.log(JSON.stringify(files));
    }
}
```

#### Register a command with sub commands

By default, the @Console will tell the module to register all decorated methods at root of the cli.  
`Example of Usage: [options] [command]`

You can name your provider to be registered in a group command container.
This is useful when you have a lot of commands and you want to group them as sub command. (git style)

To achieve this, you have to group your methods into class.
You have to pass options to the @Console decorator to configure the name of the parent cli.
Decorated methods of the providers will be registered as a sub command instead of being registered at root.

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
    }

    @Command({
        command: 'directory <name>',
        description: 'Create a directory'
    })
    async createDirectory(name: string): void | Promise<void> {
        console.log(`Creating a directory named ${name}`);
        // your code...
    }
}
```

If you need to register other sub commands from other Class to the same cli container, you have to decorate your class using the @Console decorator with the same name.

```ts
@Console({
    name: 'new' // here the name is the same as the one from MyNewService, grouping all commands
})
export class MyOtherService {...}
```

`Example of Usage: new [options] [command]`

## How to use the ConsoleService

Registering methods using the ConsoleService is more flexible than decorators.  
When you use the ConsoleService, you simply bind your methods to the cli manually.  
This is useful if you need to create the cli or a part of the cli at runtime.  
This way you can also create multiple commands and sub commands from the same context.

```ts
// service.ts - a nestjs provider
import { Injectable } from '@nestjs/common';
import { ConsoleService } from 'nestjs-console';

@Injectable()
export class MyService {
    constructor(private readonly consoleService: ConsoleService) {
        // get the root cli
        const cli = this.consoleService.getCli();

        // create a single command (See [npm commander arguments/options for more details])
        this.consoleService.createCommand(
            {
                command: 'list <directory>',
                description: 'description'
            },
            this.listContent,
            cli // attach the command to the cli
        );

        // create a parent command container
        const groupCommand = this.consoleService.createGroupCommand(
            {
                name: 'new',
                description: 'A command to create an item'
            },
            cli // attach the command to the root cli
        );

        // create command
        this.consoleService.createCommand(
            {
                command: 'file <name>',
                description: 'Create a file'
            },
            this.createFile,
            groupCommand // attach the command to the group
        );

        // create an other sub command
        this.consoleService.createCommand(
            {
                command: 'directory <name>',
                description: 'Create a directory'
            },
            this.createDirectory,
            groupCommand // attach the command to the group
        );
    }

    listContent = async (directory: string): void | Promise<void> => {
        console.log(`Listing files in directory ${directory}`);
        // your code...
    };

    createFile = async (name: string): void | Promise<void> => {
        console.log(`Creating a file named ${name}`);
        // your code...
    };

    createDirectory = async (name: string): void | Promise<void> => {
        console.log(`Creating a directory named ${name}`);
        // your code...
    };
}
```

## Command Handler signature

```ts
(...commandArguments[]; commandInstance: commander.Command) => Promise<any> | any
```

Your handler will receive all command arguments, the last argument is the command instance from commander.
You can read options from the command instance using `command.opts()`

```ts
@Command({
    description: 'A complete command handler',
        command: 'myCommandWithArgumentsAndOptions <arg1> <arg2>',

        options: [
            {
                flags: '-o1, --option1 <o1Value>',
                required: false
            },
            {
                flags: '-o2, --option2 <o1Value>',
                required: true
            }
        ]
    })
    completeCommandHandler(arg1: string, arg2: string, command: commander.Command): void {
        // read command arguments
        console.log(arg1, arg2);

        // read command options
        const options = command.opts();
        console.log(options.option1, options.option2);
    }
```

## Command Options

By default the presence of an option is not required.

-   If you need to force the presence of an option, set the required options to true.
-   If you need to force the presence of the argument of an option, you have to use `<options>` instead of `[options]`

With option.required = false  
`-o, --option` => option is optional and will be true if specified  
`-o, --option <oValue>` option is optional and oValue argument is required  
`-o, --option [oValue]` option is optional and oValue argument is also optional

With option.required = true  
`-o, --option` option is required and will be true  
`-o, --option <oValue>` option is required and oValue argument is required  
`-o, --option [oValue]` option is required but oValue argument is optional

You can use variadic option argument using `[oValue...]` and `<oValue...>`,
in this case oValue will be an array.
Details from commander https://github.com/tj/commander.js#variadic-option

## Add scripts in your package.json (if you want to use them)

```js
{
    "scripts": {
        // from sources
        "console:dev": "ts-node -r tsconfig-paths/register src/console.ts",
        // from build (we suppose your app was built in the dist folder)
        "console": "node dist/console.js"
    }
}
```

## Usage

Call the cli (production)

```bash
# using node
node dist/console.js --help
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

### [API DOCUMENTATION][doclink]

### [CHANGELOG][changelog]

[npm]: https://www.npmjs.com/package/nestjs-console
[npmchart]: https://npmcharts.com/compare/nestjs-console?minimal=true
[ci]: https://circleci.com/gh/Pop-Code/nestjs-console
[codecov]: https://codecov.io/gh/Pop-Code/nestjs-console
[doclink]: https://pop-code.github.io/nestjs-console
[commander]: https://www.npmjs.com/package/commander
[changelog]: https://github.com/Pop-Code/nestjs-console/blob/master/CHANGELOG.md
