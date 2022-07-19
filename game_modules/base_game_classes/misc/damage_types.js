"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.damage_types = exports.DamageByTypeObject = void 0;
class DamageByTypeObject {
    constructor(blunt = 0, pierce = 0, slice = 0, fire = 0) {
        this.blunt = blunt;
        this.pierce = pierce;
        this.slice = slice;
        this.fire = fire;
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
exports.damage_types = ['blunt', 'pierce', 'slice', 'fire'];
