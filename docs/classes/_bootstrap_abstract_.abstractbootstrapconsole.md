[NestJS Console](../README.md) › [Globals](../globals.md) › ["bootstrap/abstract"](../modules/_bootstrap_abstract_.md) › [AbstractBootstrapConsole](_bootstrap_abstract_.abstractbootstrapconsole.md)

# Class: AbstractBootstrapConsole <**A, O**>

An abstract class to boot a nest application

## Type parameters

▪ **A**: *INestApplicationContext*

▪ **O**: *[CommonBootstrapConsoleOptions](../interfaces/_bootstrap_abstract_.commonbootstrapconsoleoptions.md)*

## Hierarchy

* **AbstractBootstrapConsole**

  ↳ [BootstrapConsole](_bootstrap_console_.bootstrapconsole.md)

  ↳ [BootstrapConsoleServer](_bootstrap_server_.bootstrapconsoleserver.md)

## Index

### Constructors

* [constructor](_bootstrap_abstract_.abstractbootstrapconsole.md#constructor)

### Properties

* [container](_bootstrap_abstract_.abstractbootstrapconsole.md#protected-container)
* [options](_bootstrap_abstract_.abstractbootstrapconsole.md#protected-options)
* [service](_bootstrap_abstract_.abstractbootstrapconsole.md#protected-service)

### Methods

* [boot](_bootstrap_abstract_.abstractbootstrapconsole.md#boot)
* [create](_bootstrap_abstract_.abstractbootstrapconsole.md#abstract-create)
* [getService](_bootstrap_abstract_.abstractbootstrapconsole.md#getservice)
* [init](_bootstrap_abstract_.abstractbootstrapconsole.md#init)
* [useDecorators](_bootstrap_abstract_.abstractbootstrapconsole.md#protected-usedecorators)

## Constructors

###  constructor

\+ **new AbstractBootstrapConsole**(`options`: O): *[AbstractBootstrapConsole](_bootstrap_abstract_.abstractbootstrapconsole.md)*

*Defined in [src/bootstrap/abstract.ts:31](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/bootstrap/abstract.ts#L31)*

**Parameters:**

Name | Type |
------ | ------ |
`options` | O |

**Returns:** *[AbstractBootstrapConsole](_bootstrap_abstract_.abstractbootstrapconsole.md)*

## Properties

### `Protected` container

• **container**: *A*

*Defined in [src/bootstrap/abstract.ts:31](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/bootstrap/abstract.ts#L31)*

The application container

___

### `Protected` options

• **options**: *O*

*Defined in [src/bootstrap/abstract.ts:33](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/bootstrap/abstract.ts#L33)*

___

### `Protected` service

• **service**: *[ConsoleService](_service_.consoleservice.md)*

*Defined in [src/bootstrap/abstract.ts:26](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/bootstrap/abstract.ts#L26)*

The console service

## Methods

###  boot

▸ **boot**(`argv?`: string[], `displayErrors`: boolean): *Promise‹any›*

*Defined in [src/bootstrap/abstract.ts:79](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/bootstrap/abstract.ts#L79)*

Boot the console

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`argv?` | string[] | - | The list of arguments to pass to the cli, default are process.argv  |
`displayErrors` | boolean | true | - |

**Returns:** *Promise‹any›*

___

### `Abstract` create

▸ **create**(): *Promise‹A›*

*Defined in [src/bootstrap/abstract.ts:89](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/bootstrap/abstract.ts#L89)*

An abstract method to create the nest application instance.
Could return any kind of NestApplication (headless or not)

**Returns:** *Promise‹A›*

___

###  getService

▸ **getService**(): *[ConsoleService](_service_.consoleservice.md)‹›*

*Defined in [src/bootstrap/abstract.ts:71](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/bootstrap/abstract.ts#L71)*

Get the console service

**Returns:** *[ConsoleService](_service_.consoleservice.md)‹›*

___

###  init

▸ **init**(): *Promise‹A›*

*Defined in [src/bootstrap/abstract.ts:53](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/bootstrap/abstract.ts#L53)*

Init the console application

**Returns:** *Promise‹A›*

___

### `Protected` useDecorators

▸ **useDecorators**(): *this*

*Defined in [src/bootstrap/abstract.ts:44](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/bootstrap/abstract.ts#L44)*

Activate the decorators scanner

**Returns:** *this*
