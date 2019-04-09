# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[unreleased]: https://github.com/Pop-Code/nestjs-console/compare/v1.0.0-beta.1...HEAD
[0.2.2]: https://github.com/Pop-Code/nestjs-console/compare/v0.2.1...v1.0.0-beta.1
[0.2.1]: https://github.com/Pop-Code/nestjs-console/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/Pop-Code/nestjs-console/compare/v0.1.6...v0.2.0
