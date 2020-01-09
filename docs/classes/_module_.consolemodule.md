[NestJS Console](../README.md) › [Globals](../globals.md) › ["module"](../modules/_module_.md) › [ConsoleModule](_module_.consolemodule.md)

# Class: ConsoleModule

## Hierarchy

* **ConsoleModule**

## Index

### Constructors

* [constructor](_module_.consolemodule.md#constructor)

### Properties

* [scanner](_module_.consolemodule.md#protected-scanner)
* [service](_module_.consolemodule.md#protected-service)

### Methods

* [scan](_module_.consolemodule.md#scan)

## Constructors

###  constructor

\+ **new ConsoleModule**(`service`: [ConsoleService](_service_.consoleservice.md)): *[ConsoleModule](_module_.consolemodule.md)*

*Defined in [src/module.ts:19](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/module.ts#L19)*

**Parameters:**

Name | Type |
------ | ------ |
`service` | [ConsoleService](_service_.consoleservice.md) |

**Returns:** *[ConsoleModule](_module_.consolemodule.md)*

## Properties

### `Protected` scanner

• **scanner**: *[ConsoleScanner](_scanner_.consolescanner.md)* =  new ConsoleScanner()

*Defined in [src/module.ts:19](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/module.ts#L19)*

___

### `Protected` service

• **service**: *[ConsoleService](_service_.consoleservice.md)*

*Defined in [src/module.ts:21](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/module.ts#L21)*

## Methods

###  scan

▸ **scan**(`app`: INestApplicationContext, `includedModules?`: any[]): *void*

*Defined in [src/module.ts:23](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/module.ts#L23)*

**Parameters:**

Name | Type |
------ | ------ |
`app` | INestApplicationContext |
`includedModules?` | any[] |

**Returns:** *void*
