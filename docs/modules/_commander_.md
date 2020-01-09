[NestJS Console](../README.md) › [Globals](../globals.md) › ["commander"](_commander_.md)

# External module: "commander"

## Index

### Classes

* [CommandError](../classes/_commander_.commanderror.md)

### Functions

* [createCli](_commander_.md#createcli)
* [onSubCommand](_commander_.md#onsubcommand)

## Functions

###  createCli

▸ **createCli**(): *Command‹›*

*Defined in [src/commander.ts:14](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/commander.ts#L14)*

**Returns:** *Command‹›*

___

###  onSubCommand

▸ **onSubCommand**(`command`: Command, `args`: string[], `unknown`: string[]): *void*

*Defined in [src/commander.ts:31](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/commander.ts#L31)*

Callback for sub commands

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`command` | Command | The command |
`args` | string[] | The list of args returned by commander |
`unknown` | string[] | The list of unknown args returned by commander  |

**Returns:** *void*
