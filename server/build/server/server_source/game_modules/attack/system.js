"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Attack = void 0;
const damage_types_1 = require("../misc/damage_types");
const system_1 = require("../character/system");
const class_1 = require("./class");
var Attack;
(function (Attack) {
    function generate_melee(character, type) {
        const result = new class_1.AttackObj(system_1.CharacterSystem.melee_weapon_type(character));
        damage_types_1.DmgOps.add_ip(result.damage, system_1.CharacterSystem.melee_damage_raw(character, type));
        const physical_modifier = system_1.CharacterSystem.phys_power(character);
        damage_types_1.DmgOps.mult_ip(result.damage, physical_modifier / 10);
        result.attack_skill = system_1.CharacterSystem.attack_skill(character);
        damage_types_1.DmgOps.mult_ip(result.damage, 1 + result.attack_skill / 50);
        console.log(result);
        return result;
    }
    Attack.generate_melee = generate_melee;
    function best_melee_damage_type(character) {
        const damage_slice = damage_types_1.DmgOps.total(system_1.CharacterSystem.melee_damage_raw(character, 'slice'));
        const damage_blunt = damage_types_1.DmgOps.total(system_1.CharacterSystem.melee_damage_raw(character, 'blunt'));
        const damage_pierce = damage_types_1.DmgOps.total(system_1.CharacterSystem.melee_damage_raw(character, 'pierce'));
        const max = Math.max(damage_blunt, damage_pierce, damage_slice);
        if (damage_slice == max)
            return 'slice';
        if (damage_pierce == max)
            return 'pierce';
        if (damage_blunt == max)
            return 'blunt';
        return 'blunt';
    }
    Attack.best_melee_damage_type = best_melee_damage_type;
    function generate_ranged(character) {
        const result = new class_1.AttackObj('ranged');
        damage_types_1.DmgOps.add_ip(result.damage, system_1.CharacterSystem.ranged_damage_raw(character));
        const skill = character.skills.ranged;
        damage_types_1.DmgOps.mult_ip(result.damage, 1 + skill / 20);
        return result;
    }
    Attack.generate_ranged = generate_ranged;
    function generate_magic_bolt(character, dist) {
        const base_damage = 10;
        const damage = Math.round(base_damage * system_1.CharacterSystem.magic_power(character) / 10 * (1 + character.skills.magic_mastery / 10));
        const result = new class_1.AttackObj('ranged');
        result.damage.fire = damage;
        if (dist > 1) {
            result.damage.fire = Math.round(damage / 5 + (damage * 4 / 5) / dist);
        }
        return result;
    }
    Attack.generate_magic_bolt = generate_magic_bolt;
    function defend_against_melee(attack, defender) {
        const skill = Math.floor(system_1.CharacterSystem.attack_skill(defender) * (1 - defender.get_rage() / 100));
        attack.defence_skill = skill;
        const dice = Math.random();
        const crit_chance = (attack.attack_skill - attack.defence_skill) / 100 + 0.1;
        if (dice < crit_chance)
            attack.flags.crit = true;
        const res = system_1.CharacterSystem.resistance(defender);
        damage_types_1.DmgOps.subtract_ip(attack.damage, res);
    }
    Attack.defend_against_melee = defend_against_melee;
    function dodge(attack, skill) {
        let skill_diff = skill - attack.attack_skill;
        if (skill_diff <= 0)
            return;
        if (skill_diff > 100)
            skill_diff = 100;
        damage_types_1.DmgOps.mult_ip(attack.damage, 1 - skill_diff / 100);
    }
    Attack.dodge = dodge;
    function block(attack, skill) {
        // blocking is easier but harms weapon and can't block damage completely
        let skill_diff = (skill * 2 - attack.attack_skill);
        if (skill_diff <= 0)
            return;
        if (skill_diff > 60)
            skill_diff = 60;
        damage_types_1.DmgOps.mult_ip(attack.damage, 1 - skill_diff / 100);
    }
    Attack.block = block;
})(Attack = exports.Attack || (exports.Attack = {}));
// export function generate_attack(mod:'fast'|'usual'|'heavy'|'ranged'): AttackResult {
// }
//         let phys_power = this.get_phys_power() / 10
//         switch(mod) {
//             case 'usual': {phys_power = phys_power * 2; break}
//             case 'heavy': {phys_power = phys_power * 5; break}
//             case 'ranged': {phys_power = phys_power * 2; break}
//         }
//         let magic_power = this.get_magic_power() / 10
//         if (mod != 'ranged') {
//             result.attacker_status_change.rage = 5
//         }
//         result.attacker_status_change.fatigue = 1
//         result.damage['blunt'] = Math.floor(Math.max(1, result.damage['blunt'] * phys_power));
//         result.damage['pierce'] = Math.floor(Math.max(0, result.damage['pierce'] * phys_power));
//         result.damage['slice'] = Math.floor(Math.max(0, result.damage['slice'] * phys_power));
//         result.damage['fire'] = Math.floor(Math.max(0, result.damage['fire'] * magic_power));
//         return result
//     }
