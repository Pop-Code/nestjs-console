# Changelog

All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

-   A decorator `InjectCommander` to inject commander instance (patched for sub commands) as nestjs provider
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

[unreleased]: https://github.com/Pop-Code/nestjs-console/compare/v1.2.1...HEAD
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
