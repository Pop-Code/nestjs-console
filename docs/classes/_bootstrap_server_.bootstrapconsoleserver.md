[NestJS Console](../README.md) › [Globals](../globals.md) › ["bootstrap/server"](../modules/_bootstrap_server_.md) › [BootstrapConsoleServer](_bootstrap_server_.bootstrapconsoleserver.md)

# Class: BootstrapConsoleServer

A class to boot a nestjs application from cli

## Hierarchy

* [AbstractBootstrapConsole](_bootstrap_abstract_.abstractbootstrapconsole.md)‹NestApplication, [BootstrapConsoleServerOptions](../interfaces/_bootstrap_server_.bootstrapconsoleserveroptions.md)›

  ↳ **BootstrapConsoleServer**

## Index

### Constructors

* [constructor](_bootstrap_server_.bootstrapconsoleserver.md#constructor)

### Properties

* [container](_bootstrap_server_.bootstrapconsoleserver.md#protected-container)
* [options](_bootstrap_server_.bootstrapconsoleserver.md#protected-options)
* [service](_bootstrap_server_.bootstrapconsoleserver.md#protected-service)

### Methods

* [boot](_bootstrap_server_.bootstrapconsoleserver.md#boot)
* [create](_bootstrap_server_.bootstrapconsoleserver.md#create)
* [getService](_bootstrap_server_.bootstrapconsoleserver.md#getservice)
* [init](_bootstrap_server_.bootstrapconsoleserver.md#init)
* [useDecorators](_bootstrap_server_.bootstrapconsoleserver.md#protected-usedecorators)

## Constructors

###  constructor

\+ **new BootstrapConsoleServer**(`options`: [BootstrapConsoleServerOptions](../interfaces/_bootstrap_server_.bootstrapconsoleserveroptions.md)): *[BootstrapConsoleServer](_bootstrap_server_.bootstrapconsoleserver.md)*

*Inherited from [AbstractBootstrapConsole](_bootstrap_abstract_.abstractbootstrapconsole.md).[constructor](_bootstrap_abstract_.abstractbootstrapconsole.md#constructor)*

*Defined in [src/bootstrap/abstract.ts:31](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/bootstrap/abstract.ts#L31)*

**Parameters:**

Name | Type |
------ | ------ |
`options` | [BootstrapConsoleServerOptions](../interfaces/_bootstrap_server_.bootstrapconsoleserveroptions.md) |

**Returns:** *[BootstrapConsoleServer](_bootstrap_server_.bootstrapconsoleserver.md)*

## Properties

### `Protected` container

• **container**: *NestApplication*

*Inherited from [AbstractBootstrapConsole](_bootstrap_abstract_.abstractbootstrapconsole.md).[container](_bootstrap_abstract_.abstractbootstrapconsole.md#protected-container)*

*Defined in [src/bootstrap/abstract.ts:31](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/bootstrap/abstract.ts#L31)*

The application container

___

### `Protected` options

• **options**: *[BootstrapConsoleServerOptions](../interfaces/_bootstrap_server_.bootstrapconsoleserveroptions.md)*

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

▸ **create**(): *Promise‹NestApplication›*

*Overrides [AbstractBootstrapConsole](_bootstrap_abstract_.abstractbootstrapconsole.md).[create](_bootstrap_abstract_.abstractbootstrapconsole.md#abstract-create)*

*Defined in [src/bootstrap/server.ts:25](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/bootstrap/server.ts#L25)*

**Returns:** *Promise‹NestApplication›*

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
