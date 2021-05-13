"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.damage_types = exports.DamageByTypeObject = void 0;
class DamageByTypeObject {
    constructor() {
        this.blunt = 0;
        this.pierce = 0;
        this.slice = 0;
        this.fire = 0;
    }
}
exports.DamageByTypeObject = DamageByTypeObject;
exports.damage_types = new Set(['blunt', 'pierce', 'slice', 'fire']);
