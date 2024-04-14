"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Damage = void 0;
class Damage {
    constructor(blunt = 0, pierce = 0, slice = 0, fire = 0) {
        this.blunt = blunt;
        this.pierce = pierce;
        this.slice = slice;
        this.fire = fire;
    }
}
exports.Damage = Damage;

