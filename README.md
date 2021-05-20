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
2. Create a headless nest app, any module inside the app can create command and subcommands using nestjs-console with [commander][commander]
3. nestjs-console invoke commander
4. commander will do the rest.

# Documentation

-   [Wiki](https://github.com/Pop-Code/nestjs-console/wiki)
-   [API](https://pop-code.github.io/nestjs-console)
-   [Changelog](https://github.com/Pop-Code/nestjs-console/blob/master/CHANGELOG.md)
-   [Upgrade from v4 to v5](https://github.com/Pop-Code/nestjs-console/wiki/Upgrade-from-v4-to-v5)

[npm]: https://www.npmjs.com/package/nestjs-console
[npmchart]: https://npmcharts.com/compare/nestjs-console?minimal=true
[ci]: https://circleci.com/gh/Pop-Code/nestjs-console
[codecov]: https://codecov.io/gh/Pop-Code/nestjs-console
[commander]: https://www.npmjs.com/package/commander
[changelog]: https://github.com/Pop-Code/nestjs-console/blob/master/CHANGELOG.md
