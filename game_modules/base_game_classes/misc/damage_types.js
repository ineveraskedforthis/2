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
        this.blunt = this.blunt - x.blunt,
            this.pierce = this.pierce - x.pierce,
            this.slice = this.slice - x.slice,
            this.fire = this.fire - x.fire;
        return this;
    }
    copy() {
        return new Damage(this.blunt, this.pierce, this.slice, this.fire);
    }
}
exports.Damage = Damage;
exports.damage_types = ['blunt', 'pierce', 'slice', 'fire'];
