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
    add_object(x) {
        this.blunt = this.blunt + x.blunt;
        this.pierce = this.pierce + x.pierce;
        this.slice = this.slice + x.slice;
        this.fire = this.fire + x.fire;
        return this;
    }
}
exports.DamageByTypeObject = DamageByTypeObject;
exports.damage_types = new Set(['blunt', 'pierce', 'slice', 'fire']);
