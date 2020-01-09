[NestJS Console](../README.md) › [Globals](../globals.md) › ["commander"](../modules/_commander_.md) › [CommandError](_commander_.commanderror.md)

# Class: CommandError

A class to returns errors without exit code 1
Any command and sub command can throw this error.
The cli will display the error message with the help of the cli.

## Hierarchy

* Error

  ↳ **CommandError**

## Index

### Constructors

* [constructor](_commander_.commanderror.md#constructor)

### Properties

* [command](_commander_.commanderror.md#command)
* [message](_commander_.commanderror.md#message)
* [name](_commander_.commanderror.md#name)
* [stack](_commander_.commanderror.md#optional-stack)
* [Error](_commander_.commanderror.md#static-error)

## Constructors

###  constructor

\+ **new CommandError**(`message`: string, `command`: Command): *[CommandError](_commander_.commanderror.md)*

*Defined in [src/commander.ts:8](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/commander.ts#L8)*

**Parameters:**

Name | Type |
------ | ------ |
`message` | string |
`command` | Command |

**Returns:** *[CommandError](_commander_.commanderror.md)*

## Properties

###  command

• **command**: *Command*

*Defined in [src/commander.ts:9](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/commander.ts#L9)*

___

###  message

• **message**: *string*

*Inherited from void*

Defined in node_modules/typescript/lib/lib.es5.d.ts:974

___

###  name

• **name**: *string*

*Inherited from void*

Defined in node_modules/typescript/lib/lib.es5.d.ts:973

___

### `Optional` stack

• **stack**? : *string*

*Inherited from void*

Defined in node_modules/typescript/lib/lib.es5.d.ts:975

___

### `Static` Error

▪ **Error**: *ErrorConstructor*

Defined in node_modules/typescript/lib/lib.es5.d.ts:984
