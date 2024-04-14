"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.damage_types = exports.DmgOps = void 0;
const Damage_1 = require("./Damage");
var DmgOps;
(function (DmgOps) {
    function add(y, x) {
        let response = new Damage_1.Damage();
        for (let t of exports.damage_types) {
            response[t] = x[t] + y[t];
        }
        return response;
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
        let response = new Damage_1.Damage();
        for (let t of exports.damage_types) {
            response[t] = Math.max(x[t] - y[t], 0);
        }
        return response;
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
        return new Damage_1.Damage(x.blunt, x.pierce, x.slice, x.fire);
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
})(DmgOps || (exports.DmgOps = DmgOps = {}));
exports.damage_types = ['blunt', 'pierce', 'slice', 'fire'];
