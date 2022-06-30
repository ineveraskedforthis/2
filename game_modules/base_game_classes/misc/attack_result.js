"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttackResult = void 0;
const damage_types_1 = require("./damage_types");
class AttackResult {
    constructor() {
        this.flags = {
            crit: false,
            evade: false,
            miss: false,
            poison: false,
            blocked: false,
            close_distance: false,
            killing_strike: false
        };
        this.defender_status_change = {
            hp: 0,
            rage: 0,
            stress: 0,
            blood: 0,
            fatigue: 0
        };
        this.attacker_status_change = {
            hp: 0,
            rage: 0,
            stress: 0,
            blood: 0,
            fatigue: 0
        };
        this.new_pos = undefined;
        this.damage = new damage_types_1.DamageByTypeObject();
        this.weapon_type = 'noweapon';
        this.chance_to_hit = 0;
        this.total_damage = 0;
    }
}
exports.AttackResult = AttackResult;
