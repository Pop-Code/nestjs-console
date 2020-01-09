[NestJS Console](../README.md) › [Globals](../globals.md) › ["commands/application-manager"](../modules/_commands_application_manager_.md) › [ApplicationManager](_commands_application_manager_.applicationmanager.md)

# Class: ApplicationManager

The ApplicationManager is a class binded to a command that can start a the app server

## Hierarchy

* **ApplicationManager**

## Index

### Constructors

* [constructor](_commands_application_manager_.applicationmanager.md#constructor)

### Properties

* [consoleService](_commands_application_manager_.applicationmanager.md#private-consoleservice)

### Methods

* [checkContainerInterface](_commands_application_manager_.applicationmanager.md#protected-checkcontainerinterface)
* [start](_commands_application_manager_.applicationmanager.md#start)

## Constructors

###  constructor

\+ **new ApplicationManager**(`consoleService`: [ConsoleService](_service_.consoleservice.md)): *[ApplicationManager](_commands_application_manager_.applicationmanager.md)*

*Defined in [src/commands/application-manager.ts:13](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/commands/application-manager.ts#L13)*

**Parameters:**

Name | Type |
------ | ------ |
`consoleService` | [ConsoleService](_service_.consoleservice.md) |

**Returns:** *[ApplicationManager](_commands_application_manager_.applicationmanager.md)*

## Properties

### `Private` consoleService

• **consoleService**: *[ConsoleService](_service_.consoleservice.md)*

*Defined in [src/commands/application-manager.ts:14](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/commands/application-manager.ts#L14)*

## Methods

### `Protected` checkContainerInterface

▸ **checkContainerInterface**(`container`: any): *NestApplication*

*Defined in [src/commands/application-manager.ts:16](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/commands/application-manager.ts#L16)*

**Parameters:**

Name | Type |
------ | ------ |
`container` | any |

**Returns:** *NestApplication*

___

###  start

▸ **start**(`command`: Command): *Promise‹Command‹››*

*Defined in [src/commands/application-manager.ts:50](https://github.com/Pop-Code/nestjs-console/blob/7562159/src/commands/application-manager.ts#L50)*

Start the application http server

**Parameters:**

Name | Type |
------ | ------ |
`command` | Command |

**Returns:** *Promise‹Command‹››*
