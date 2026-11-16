var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Command, Console } from '../../../src/decorators.js';
let CliMergedWithNamedDecorator = class CliMergedWithNamedDecorator {
    subCommandMerged(myArgument) {
        console.log(myArgument);
        return myArgument;
    }
};
__decorate([
    Command({
        command: 'subCommandMerged <myArgument>'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", String)
], CliMergedWithNamedDecorator.prototype, "subCommandMerged", null);
CliMergedWithNamedDecorator = __decorate([
    Console({
        command: 'groupCommand'
    })
], CliMergedWithNamedDecorator);
export { CliMergedWithNamedDecorator };
