"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.damage_types = exports.DmgOps = exports.Damage = void 0;
class Damage {
    constructor(blunt = 0, pierce = 0, slice = 0, fire = 0) {
        this.blunt = blunt;
        this.pierce = pierce;
        this.slice = slice;
        this.fire = fire;
    }
}
exports.Damage = Damage;
var DmgOps;
(function (DmgOps) {
    function add(y, x) {
        let responce = new Damage();
        for (let t of exports.damage_types) {
            responce[t] = x[t] + y[t];
        }
        return responce;
    }
    DmgOps.add = add;
    function add_ip(x, y) {
        for (let t of exports.damage_types) {
            x[t] = x[t] + y[t];
        }
        return x;
    }
    DmgOps.add_ip = add_ip;
    function subtract(x, y) {
        let responce = new Damage();
        for (let t of exports.damage_types) {
            responce[t] = Math.max(x[t] - y[t], 0);
        }
        return responce;
    }
    DmgOps.subtract = subtract;
    function subtract_ip(x, y) {
        for (let t of exports.damage_types) {
            x[t] = Math.max(x[t] - y[t], 0);
        }
        return x;
    }
    DmgOps.subtract_ip = subtract_ip;
    function mult_ip(x, m) {
        for (let i of exports.damage_types) {
            x[i] = Math.max(Math.floor(x[i] * m), 0);
        }
        return x;
    }
    DmgOps.mult_ip = mult_ip;
    function copy(x) {
        return new Damage(x.blunt, x.pierce, x.slice, x.fire);
    }
    DmgOps.copy = copy;
    function total(x) {
        let total = 0;
        for (let tag of exports.damage_types) {
            total += x[tag];
        }
        return total;
    }
    DmgOps.total = total;
})(DmgOps = exports.DmgOps || (exports.DmgOps = {}));
exports.damage_types = ['blunt', 'pierce', 'slice', 'fire'];
