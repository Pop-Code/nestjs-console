[NestJS Console](../README.md) › [Globals](../globals.md) › ["service"](../modules/_service_.md) › [ConsoleService](_service_.consoleservice.md)

# Class: ConsoleService

## Hierarchy

* **ConsoleService**

## Index

### Constructors

* [constructor](_service_.consoleservice.md#constructor)

### Properties

* [cli](_service_.consoleservice.md#protected-cli)
* [commands](_service_.consoleservice.md#protected-commands)
* [container](_service_.consoleservice.md#protected-container)
* [eventManager](_service_.consoleservice.md#protected-eventmanager)

### Methods

* [createCommand](_service_.consoleservice.md#createcommand)
* [createHandler](_service_.consoleservice.md#createhandler)
* [createSubCommand](_service_.consoleservice.md#createsubcommand)
* [getCli](_service_.consoleservice.md#getcli)
* [getContainer](_service_.consoleservice.md#getcontainer)
* [init](_service_.consoleservice.md#init)
* [logError](_service_.consoleservice.md#logerror)
* [resetCli](_service_.consoleservice.md#resetcli)
* [setContainer](_service_.consoleservice.md#setcontainer)

## Constructors

###  constructor

\+ **new ConsoleService**(`cli`: Command): *[ConsoleService](_service_.consoleservice.md)*

*Defined in [src/service.ts:16](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/service.ts#L16)*

**Parameters:**

Name | Type |
------ | ------ |
`cli` | Command |

**Returns:** *[ConsoleService](_service_.consoleservice.md)*

## Properties

### `Protected` cli

• **cli**: *Command*

*Defined in [src/service.ts:18](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/service.ts#L18)*

___

### `Protected` commands

• **commands**: *Map‹string, Command›* =  new Map()

*Defined in [src/service.ts:15](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/service.ts#L15)*

___

### `Protected` container

• **container**: *INestApplicationContext*

*Defined in [src/service.ts:14](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/service.ts#L14)*

___

### `Protected` eventManager

• **eventManager**: *EventEmitter* =  new EventEmitter()

*Defined in [src/service.ts:16](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/service.ts#L16)*

## Methods

###  createCommand

▸ **createCommand**(`options`: [ICommandDecoratorOptions](../interfaces/_decorators_.icommanddecoratoroptions.md), `handler`: function, `parent`: Command): *Command‹›*

*Defined in [src/service.ts:127](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/service.ts#L127)*

**Parameters:**

▪ **options**: *[ICommandDecoratorOptions](../interfaces/_decorators_.icommanddecoratoroptions.md)*

▪ **handler**: *function*

▸ (...`args`: any[]): *any*

**Parameters:**

Name | Type |
------ | ------ |
`...args` | any[] |

▪ **parent**: *Command*

**Returns:** *Command‹›*

___

###  createHandler

▸ **createHandler**(`action`: function): *(Anonymous function)*

*Defined in [src/service.ts:60](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/service.ts#L60)*

**Parameters:**

▪ **action**: *function*

▸ (...`args`: any[]): *any*

**Parameters:**

Name | Type |
------ | ------ |
`...args` | any[] |

**Returns:** *(Anonymous function)*

___

###  createSubCommand

▸ **createSubCommand**(`options`: [IConsoleOptions](../interfaces/_decorators_.iconsoleoptions.md), `parent`: Command): *Command*

*Defined in [src/service.ts:159](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/service.ts#L159)*

Create a sub command.

**`throws`** an error if the parent command contains explicit arguments, only simple commands are allowed (no spaces)

**Parameters:**

Name | Type |
------ | ------ |
`options` | [IConsoleOptions](../interfaces/_decorators_.iconsoleoptions.md) |
`parent` | Command |

**Returns:** *Command*

___

###  getCli

▸ **getCli**(`name?`: string): *Command‹›*

*Defined in [src/service.ts:41](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/service.ts#L41)*

Get a cli

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`name?` | string | Get a cli by name, if not set, the root cli is used  |

**Returns:** *Command‹›*

___

###  getContainer

▸ **getContainer**(): *INestApplicationContext*

*Defined in [src/service.ts:56](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/service.ts#L56)*

Get the container

**Returns:** *INestApplicationContext*

___

###  init

▸ **init**(`argv`: string[], `displayErrors`: boolean): *Promise‹any›*

*Defined in [src/service.ts:77](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/service.ts#L77)*

Execute the cli

**Parameters:**

Name | Type |
------ | ------ |
`argv` | string[] |
`displayErrors` | boolean |

**Returns:** *Promise‹any›*

___

###  logError

▸ **logError**(`command`: Command, `error`: Error): *void*

*Defined in [src/service.ts:32](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/service.ts#L32)*

Log an error

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`command` | Command | The command related to the error |
`error` | Error | The error to format  |

**Returns:** *void*

___

###  resetCli

▸ **resetCli**(): *void*

*Defined in [src/service.ts:23](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/service.ts#L23)*

Reset the cli stack (for testing purpose only)

**Returns:** *void*

___

###  setContainer

▸ **setContainer**(`container`: INestApplicationContext): *[ConsoleService](_service_.consoleservice.md)*

*Defined in [src/service.ts:48](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/service.ts#L48)*

Set the container

**Parameters:**

Name | Type |
------ | ------ |
`container` | INestApplicationContext |

**Returns:** *[ConsoleService](_service_.consoleservice.md)*
