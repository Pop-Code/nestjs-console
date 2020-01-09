[NestJS Console](../README.md) › [Globals](../globals.md) › ["bootstrap/console"](../modules/_bootstrap_console_.md) › [BootstrapConsole](_bootstrap_console_.bootstrapconsole.md)

# Class: BootstrapConsole

A class to boot a nestjs application context from cli

## Hierarchy

* [AbstractBootstrapConsole](_bootstrap_abstract_.abstractbootstrapconsole.md)‹INestApplicationContext, [BootstrapConsoleOptions](../interfaces/_bootstrap_console_.bootstrapconsoleoptions.md)›

  ↳ **BootstrapConsole**

## Index

### Constructors

* [constructor](_bootstrap_console_.bootstrapconsole.md#constructor)

### Properties

* [container](_bootstrap_console_.bootstrapconsole.md#protected-container)
* [options](_bootstrap_console_.bootstrapconsole.md#protected-options)
* [service](_bootstrap_console_.bootstrapconsole.md#protected-service)

### Methods

* [boot](_bootstrap_console_.bootstrapconsole.md#boot)
* [create](_bootstrap_console_.bootstrapconsole.md#create)
* [getService](_bootstrap_console_.bootstrapconsole.md#getservice)
* [init](_bootstrap_console_.bootstrapconsole.md#init)
* [useDecorators](_bootstrap_console_.bootstrapconsole.md#protected-usedecorators)

## Constructors

###  constructor

\+ **new BootstrapConsole**(`options`: [BootstrapConsoleOptions](../interfaces/_bootstrap_console_.bootstrapconsoleoptions.md)): *[BootstrapConsole](_bootstrap_console_.bootstrapconsole.md)*

*Inherited from [AbstractBootstrapConsole](_bootstrap_abstract_.abstractbootstrapconsole.md).[constructor](_bootstrap_abstract_.abstractbootstrapconsole.md#constructor)*

*Defined in [src/bootstrap/abstract.ts:31](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/bootstrap/abstract.ts#L31)*

**Parameters:**

Name | Type |
------ | ------ |
`options` | [BootstrapConsoleOptions](../interfaces/_bootstrap_console_.bootstrapconsoleoptions.md) |

**Returns:** *[BootstrapConsole](_bootstrap_console_.bootstrapconsole.md)*

## Properties

### `Protected` container

• **container**: *INestApplicationContext*

*Inherited from [AbstractBootstrapConsole](_bootstrap_abstract_.abstractbootstrapconsole.md).[container](_bootstrap_abstract_.abstractbootstrapconsole.md#protected-container)*

*Defined in [src/bootstrap/abstract.ts:31](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/bootstrap/abstract.ts#L31)*

The application container

___

### `Protected` options

• **options**: *[BootstrapConsoleOptions](../interfaces/_bootstrap_console_.bootstrapconsoleoptions.md)*

*Inherited from [AbstractBootstrapConsole](_bootstrap_abstract_.abstractbootstrapconsole.md).[options](_bootstrap_abstract_.abstractbootstrapconsole.md#protected-options)*

*Defined in [src/bootstrap/abstract.ts:33](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/bootstrap/abstract.ts#L33)*

___

### `Protected` service

• **service**: *[ConsoleService](_service_.consoleservice.md)*

*Inherited from [AbstractBootstrapConsole](_bootstrap_abstract_.abstractbootstrapconsole.md).[service](_bootstrap_abstract_.abstractbootstrapconsole.md#protected-service)*

*Defined in [src/bootstrap/abstract.ts:26](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/bootstrap/abstract.ts#L26)*

The console service

## Methods

###  boot

▸ **boot**(`argv?`: string[], `displayErrors`: boolean): *Promise‹any›*

*Inherited from [AbstractBootstrapConsole](_bootstrap_abstract_.abstractbootstrapconsole.md).[boot](_bootstrap_abstract_.abstractbootstrapconsole.md#boot)*

*Defined in [src/bootstrap/abstract.ts:79](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/bootstrap/abstract.ts#L79)*

Boot the console

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`argv?` | string[] | - | The list of arguments to pass to the cli, default are process.argv  |
`displayErrors` | boolean | true | - |

**Returns:** *Promise‹any›*

___

###  create

▸ **create**(): *Promise‹INestApplicationContext›*

*Overrides [AbstractBootstrapConsole](_bootstrap_abstract_.abstractbootstrapconsole.md).[create](_bootstrap_abstract_.abstractbootstrapconsole.md#abstract-create)*

*Defined in [src/bootstrap/console.ts:23](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/bootstrap/console.ts#L23)*

**Returns:** *Promise‹INestApplicationContext›*

___

###  getService

▸ **getService**(): *[ConsoleService](_service_.consoleservice.md)‹›*

*Inherited from [AbstractBootstrapConsole](_bootstrap_abstract_.abstractbootstrapconsole.md).[getService](_bootstrap_abstract_.abstractbootstrapconsole.md#getservice)*

*Defined in [src/bootstrap/abstract.ts:71](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/bootstrap/abstract.ts#L71)*

Get the console service

**Returns:** *[ConsoleService](_service_.consoleservice.md)‹›*

___

###  init

▸ **init**(): *Promise‹A›*

*Inherited from [AbstractBootstrapConsole](_bootstrap_abstract_.abstractbootstrapconsole.md).[init](_bootstrap_abstract_.abstractbootstrapconsole.md#init)*

*Defined in [src/bootstrap/abstract.ts:53](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/bootstrap/abstract.ts#L53)*

Init the console application

**Returns:** *Promise‹A›*

___

### `Protected` useDecorators

▸ **useDecorators**(): *this*

*Inherited from [AbstractBootstrapConsole](_bootstrap_abstract_.abstractbootstrapconsole.md).[useDecorators](_bootstrap_abstract_.abstractbootstrapconsole.md#protected-usedecorators)*

*Defined in [src/bootstrap/abstract.ts:44](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/bootstrap/abstract.ts#L44)*

Activate the decorators scanner

**Returns:** *this*
