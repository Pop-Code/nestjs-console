# Changelog

All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [7.0.1] - 2021-11-25

### Changed

-   Add commander version as direct dependency
-   Update dependencies
-   Remove node engine from the runtime requirements

## [7.0.0] - 2021-07-28

### BREAKING CHANGE

-   Migrate to commander v8.1.0.

## [6.0.0] - 2021-07-09

### BREAKING CHANGE

-   Migrate to nestjs v8.0.0.
    Thanks to [@Minishlink](https://github.com/Minishlink)

## [5.0.1] - 2021-04-13

### BREAKING CHANGE

-   Signature of `@Console` decorator has been updated.  
    ConsoleOptions has been replaced by CreateCommandOptions, to update from ^4.0.0 you simply have to change property `name` by `command`.  
    eg: `@Console({name: "myCommand"})` => `@Console({command: "myCommand"})`
-   Command handler signature has changed. Options are now passed to the handler. See [the command handler signature for more details](https://github.com/Pop-Code/nestjs-console/wiki/Command-handler-signature#signature)
-   Commander@< 7.2.0 is not any more supported. Please upgrade to latest version `npm install commander@^7.2.0` or using yarn `yarn add commander@^7.2.0`
-   The helper formatResponse has been removed

### Changed

-   Update tests
-   Remove calls to `command.exitOverride()` to simplify code
-   Native errors handling with commander
-   update docs
-   update dependencies
-   Update to work with commander@7.2.0

### Added

-   All commands and sub commands are stored in the ConsoleService and can be found using the `ConsoleService.getCommand(name: string)`. Name is a command path separated by dots. eg: `parent.command.subcommand`
-   Sub commands can now be registered on other subCommand without any args. If a parent command define options, they can be retrieved using `command.parent.opts()` inside the executed subCommand. This allow you to create group of command with global options based on parent options

### Fixed

-   fix #302

## [4.0.0] - 2020-10-16

### BREAKING CHANGE

-   Remove Pretiier format helpers and use JSON.stringify instead to reduce package size.

### Changed

-   update dependencies
-   update docs

## [3.1.0] - 2020-07-30

### Changed

-   Update dependencies
-   Update commander to v6

### Added

-   Support required options (Warning, required options means option is required not the value. To force a required value use `<option>` instead `[option]`)

## [3.0.6] - 2020-06-10

### Fixed

-   Fix: command accept multiple arguments https://github.com/Pop-Code/nestjs-console/issues/148 (thanks to https://github.com/tzellman)

### Changed

-   Update dependencies

## [3.0.5] - 2020-05-05

### Changed

-   Fix #140 and #145 remove allowSyntheticDefaultImports to fit default nest application

## [3.0.4] - 2020-04-05

### Changed

-   Update dependencies
-   Remove ignored files from npm build
-   Fix #140 replace esModuleInterop by allowSyntheticDefaultImports

## [3.0.2] - 2020-23-04

### Changed

-   Update dependencies
-   Update to support nest mono repo >= 7.0.0

### Breaking

-   Update to Commander >= 5.0.0

## [2.1.0] - 2020-02-03

### Changed

-   Update dependencies

### Breaking

-   Node 8 (carbon) is now deprecated (jest > v25)
-   Update to Commander >= 4.1.1

### Added

-   add badges in readme

## [2.0.3] - 2020-02-03

### Fixed

-   Fix the return of the service's command. Updating the service to use `commander.parseAsync()` instead of `commander.parse()`. Promise are now handled without event listener. Tests were improved.

### Changed

-   Replace tslint by eslint
-   Remove I prefix from interfaces

## [2.0.1] - 2020-01-16

### Fixed

-   Fix the app scanner register commands using decorators. Scanner now works with external and dynamic modules

## [2.0.0] - 2020-01-15

### Changed

-   BootstrapConsole method are not any more static. You must create an instance to boot.
-   ConsoleService new methods `createCommand` and `createGroupCommand`
-   Update dependencies versions
-   Update to support commander ^4.0.1

### Added

-   Possiblity to register multi dimensions commands and sub commands using decorators. (@Console({name: 'cliName'})). If two or more Console decorators with the same name are found, they will be grouped.
-   Fix Command lifecycle to be able to resolve command's return or to catch errors
-   BootstrapConsole.boot() return a promise resolving the command's return or throwing an error. This is usefull for testing.

## [1.2.1] - 2020-01-03

### Fixed

-   Fix a type error during the bootstrap scan for decorators [#61](https://github.com/Pop-Code/nestjs-console/pull/61)
-   Remove implicit lodash dependency [#59](https://github.com/Pop-Code/nestjs-console/issues/59)
-   Update to support commander@^4 [#58](https://github.com/Pop-Code/nestjs-console/issues/58)

## [1.2.0] - 2019-08-09

### Changed

-   Move commander as Peer Dependency
-   Update to support commander@^3.0.0

## [1.1.4] - 2019-06-25

### Added

-   Possiblity to register commands and sub commands (2d) using decorators.
    2 new decorators @Console() and @Command()

## [1.0.2] - 2019-05-29

### Fixed

-   Issue #18

## [1.0.1] - 2019-04-21

### Fixed

-   Remove typescript peer dependency.

### Changed

-   Update dependencies versions

## [1.0.0] - 2019-04-12

### Changed

-   The bootstrap method has been moved and is now static in the new `BootstrapConsole` class, you can extend it if you need to change the default boot behavior.
-   New options for bootstrap

## [1.0.0-alpha.1] - 2019-04-08

### Added

-   A decorator `InjectCli` to inject commander instance (patched for sub commands) as nestjs provider
-   A new methods `subCommands() => Command` in the class `ConsoleService` to get sub commands from a non patched commander instance.
-   Tests

### Changed

-   Update docs

### Removed

-   The instance method ConsoleService.log method was removed.
-   The PatchedCommander interface was removed. You can import the Command interface from the nestjs-console module instead.

### Fixed

-   Improve Commander override, type and service
-   Fix git style sub commands to return a result if no arguments are submitted to the cli.
-   Update of the bootstrap function signature

## [0.2.1] - 2019-04-07

### Fixed

-   Fix doc

## [0.2.0] - 2019-04-07

### Changed

-   Update the dependencies to support nestjs ^6.0.0

[unreleased]: https://github.com/Pop-Code/nestjs-console/compare/v7.0.1...HEAD
[7.0.1]: https://github.com/Pop-Code/nestjs-console/compare/v7.0.0...v7.0.1
[7.0.0]: https://github.com/Pop-Code/nestjs-console/compare/v6.0.0...v5.0.1
[6.0.0]: https://github.com/Pop-Code/nestjs-console/compare/v5.0.1...v4.0.0
[5.0.1]: https://github.com/Pop-Code/nestjs-console/compare/v4.0.0...v3.1.0
[4.0.0]: https://github.com/Pop-Code/nestjs-console/compare/v3.1.0...v4.0.0
[3.1.0]: https://github.com/Pop-Code/nestjs-console/compare/v3.0.6...v3.1.0
[3.0.6]: https://github.com/Pop-Code/nestjs-console/compare/v3.0.5...v3.0.6
[3.0.5]: https://github.com/Pop-Code/nestjs-console/compare/v3.0.4...v3.0.5
[3.0.5]: https://github.com/Pop-Code/nestjs-console/compare/v3.0.3...v3.0.5
[3.0.4]: https://github.com/Pop-Code/nestjs-console/compare/v3.0.3...v3.0.4
[3.0.3]: https://github.com/Pop-Code/nestjs-console/compare/v3.0.2...v3.0.3
[3.0.2]: https://github.com/Pop-Code/nestjs-console/compare/v2.1.1...v3.0.2
[2.1.0]: https://github.com/Pop-Code/nestjs-console/compare/v2.0.3...v2.1.0
[2.0.3]: https://github.com/Pop-Code/nestjs-console/compare/v2.0.2...v2.0.3
[2.0.2]: https://github.com/Pop-Code/nestjs-console/compare/v2.0.1...v2.0.2
[2.0.1]: https://github.com/Pop-Code/nestjs-console/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/Pop-Code/nestjs-console/compare/v1.2.2...v2.0.0
[1.2.2]: https://github.com/Pop-Code/nestjs-console/compare/v1.2.1...v1.2.2
[1.2.1]: https://github.com/Pop-Code/nestjs-console/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/Pop-Code/nestjs-console/compare/v1.1.4...v1.2.0
[1.1.4]: https://github.com/Pop-Code/nestjs-console/compare/v1.0.2...v1.1.4
[1.0.2]: https://github.com/Pop-Code/nestjs-console/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/Pop-Code/nestjs-console/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/Pop-Code/nestjs-console/compare/v1.0.0-alpha.1...v1.0.0
[1.0.0-alpha.1]: https://github.com/Pop-Code/nestjs-console/compare/v0.2.2...v1.0.0-alpha.1
[0.2.2]: https://github.com/Pop-Code/nestjs-console/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/Pop-Code/nestjs-console/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/Pop-Code/nestjs-console/compare/v0.1.6...v0.2.0
