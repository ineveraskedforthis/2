"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.spells = void 0;
const damage_types_1 = require("../base_game_classes/misc/damage_types");
exports.spells = {
    'bolt': (result) => {
        let damage = new damage_types_1.DamageByTypeObject(5, 0, 0, 0);
        result.damage = damage;
        return result;
    },
    'charge': (result) => {
        let damage = {};
        result.damage = new damage_types_1.DamageByTypeObject(10, 0, 0, 0);
        result.flags.close_distance = true;
        result.attacker_status_change.rage = 20;
        return result;
    }
};
