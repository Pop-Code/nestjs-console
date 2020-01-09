[NestJS Console](../README.md) › [Globals](../globals.md) › ["helpers"](_helpers_.md)

# External module: "helpers"

## Index

### Functions

* [createSpinner](_helpers_.md#createspinner)
* [formatResponse](_helpers_.md#formatresponse)

## Functions

###  createSpinner

▸ **createSpinner**(`opts?`: Options): *Ora*

*Defined in [src/helpers.ts:9](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/helpers.ts#L9)*

Create an ora spinner

**`see`** https://www.npmjs.com/package/ora

**Parameters:**

Name | Type |
------ | ------ |
`opts?` | Options |

**Returns:** *Ora*

___

###  formatResponse

▸ **formatResponse**(`data`: string | Error, `options?`: PrettierOptions): *string*

*Defined in [src/helpers.ts:13](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/helpers.ts#L13)*

**Parameters:**

Name | Type |
------ | ------ |
`data` | string &#124; Error |
`options?` | PrettierOptions |

**Returns:** *string*
