"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttackObj = void 0;
const damage_types_1 = require("../misc/damage_types");
class AttackObj {
    constructor(weapon_type) {
        this.flags = {
            crit: false,
            miss: false,
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
        this.damage = new damage_types_1.Damage();
        this.weapon_type = weapon_type;
        this.chance_to_hit = 0;
        this.attack_skill = 0;
        this.defence_skill = 0;
    }
}
exports.AttackObj = AttackObj;
