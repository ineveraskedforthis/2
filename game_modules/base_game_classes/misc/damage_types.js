"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.damage_types = exports.Damage = void 0;
class Damage {
    constructor(blunt = 0, pierce = 0, slice = 0, fire = 0) {
        this.blunt = blunt;
        this.pierce = pierce;
        this.slice = slice;
        this.fire = fire;
    }
    add(x) {
        this.blunt = this.blunt + x.blunt;
        this.pierce = this.pierce + x.pierce;
        this.slice = this.slice + x.slice;
        this.fire = this.fire + x.fire;
        return this;
    }
    subtract(x) {
        this.blunt = Math.max(0, this.blunt - x.blunt),
            this.pierce = Math.max(0, this.pierce - x.pierce),
            this.slice = Math.max(0, this.slice - x.slice),
            this.fire = Math.max(0, this.fire - x.fire);
        return this;
    }
    mult(m) {
        for (let i of exports.damage_types) {
            this[i] = Math.max(Math.floor(this[i] * m), 0);
        }
    }
    copy() {
        return new Damage(this.blunt, this.pierce, this.slice, this.fire);
    }
}
exports.Damage = Damage;
exports.damage_types = ['blunt', 'pierce', 'slice', 'fire'];
