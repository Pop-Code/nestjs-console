[NestJS Console](../README.md) › [Globals](../globals.md) › ["scanner"](../modules/_scanner_.md) › [ConsoleScanner](_scanner_.consolescanner.md)

# Class: ConsoleScanner

## Hierarchy

* **ConsoleScanner**

## Index

### Methods

* [getInstanceMethods](_scanner_.consolescanner.md#private-getinstancemethods)
* [getModules](_scanner_.consolescanner.md#private-getmodules)
* [scan](_scanner_.consolescanner.md#scan)

## Methods

### `Private` getInstanceMethods

▸ **getInstanceMethods**(`instance`: any): *string[]*

*Defined in [src/scanner.ts:40](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/scanner.ts#L40)*

Get a list of classes methods

**Parameters:**

Name | Type |
------ | ------ |
`instance` | any |

**Returns:** *string[]*

___

### `Private` getModules

▸ **getModules**(`modulesContainer`: Map‹any, any›, `include`: any[]): *any[]*

*Defined in [src/scanner.ts:27](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/scanner.ts#L27)*

Get all the modules

**Parameters:**

Name | Type |
------ | ------ |
`modulesContainer` | Map‹any, any› |
`include` | any[] |

**Returns:** *any[]*

___

###  scan

▸ **scan**(`app`: INestApplicationContext, `includedModules?`: any[]): *Set‹[IScanResponse](../interfaces/_scanner_.iscanresponse.md)›*

*Defined in [src/scanner.ts:53](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/scanner.ts#L53)*

Scan an application

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`app` | INestApplicationContext | - |
`includedModules?` | any[] |   |

**Returns:** *Set‹[IScanResponse](../interfaces/_scanner_.iscanresponse.md)›*
