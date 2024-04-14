"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.spells = void 0;
const damage_types_1 = require("../misc/damage_types");
exports.spells = {
    'bolt': (result) => {
        let damage = new damage_types_1.Damage(5, 0, 0, 0);
        result.damage = damage;
        return result;
    },
    'charge': (result) => {
        let damage = {};
        result.damage = new damage_types_1.Damage(10, 0, 0, 0);
        result.flags.close_distance = true;
        result.attacker_status_change.rage = 20;
        return result;
    }
};













































