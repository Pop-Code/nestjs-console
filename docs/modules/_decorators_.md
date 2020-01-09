[NestJS Console](../README.md) › [Globals](../globals.md) › ["decorators"](_decorators_.md)

# External module: "decorators"

## Index

### Interfaces

* [ICommandDecoratorOptions](../interfaces/_decorators_.icommanddecoratoroptions.md)
* [ICommandOptions](../interfaces/_decorators_.icommandoptions.md)
* [IConsoleOptions](../interfaces/_decorators_.iconsoleoptions.md)

### Functions

* [Command](_decorators_.md#command)
* [Console](_decorators_.md#console)
* [InjectCommander](_decorators_.md#injectcommander)

## Functions

###  Command

▸ **Command**(`options`: [ICommandDecoratorOptions](../interfaces/_decorators_.icommanddecoratoroptions.md)): *(Anonymous function)*

*Defined in [src/decorators.ts:27](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/decorators.ts#L27)*

**Parameters:**

Name | Type |
------ | ------ |
`options` | [ICommandDecoratorOptions](../interfaces/_decorators_.icommanddecoratoroptions.md) |

**Returns:** *(Anonymous function)*

___

###  Console

▸ **Console**(`options?`: [IConsoleOptions](../interfaces/_decorators_.iconsoleoptions.md)): *(Anonymous function)*

*Defined in [src/decorators.ts:37](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/decorators.ts#L37)*

**Parameters:**

Name | Type |
------ | ------ |
`options?` | [IConsoleOptions](../interfaces/_decorators_.iconsoleoptions.md) |

**Returns:** *(Anonymous function)*

___

###  InjectCommander

▸ **InjectCommander**(): *function*

*Defined in [src/decorators.ts:9](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/decorators.ts#L9)*

**Returns:** *function*

▸ (`target`: Object, `key`: string | symbol, `index?`: number): *void*

**Parameters:**

Name | Type |
------ | ------ |
`target` | Object |
`key` | string &#124; symbol |
`index?` | number |
