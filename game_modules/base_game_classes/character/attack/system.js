"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Attack = void 0;
const system_1 = require("../system");
const class_1 = require("./class");
var Attack;
(function (Attack) {
    function generate_melee(character, type) {
        const result = new class_1.AttackObj(system_1.CharacterSystem.weapon_type(character));
        result.damage.add(system_1.CharacterSystem.melee_damage_raw(character, type));
        const physical_modifier = system_1.CharacterSystem.phys_power(character);
        result.damage.mult(1 + physical_modifier / 10);
        result.attack_skill = system_1.CharacterSystem.attack_skill(character);
        result.damage.mult(1 + result.attack_skill / 50);
        return result;
    }
    Attack.generate_melee = generate_melee;
    function generate_ranged(character) {
        const result = new class_1.AttackObj('ranged');
        result.damage.add(system_1.CharacterSystem.ranged_damage_raw(character));
        const skill = character.skills.ranged;
        result.damage.mult(1 + skill / 20);
        return result;
    }
    Attack.generate_ranged = generate_ranged;
    function defend_against_melee(attack, defender) {
        const skill = Math.floor(system_1.CharacterSystem.attack_skill(defender) * (1 - defender.get_rage() / 100));
        attack.defence_skill = skill;
        const dice = Math.random();
        const crit_chance = (attack.attack_skill - attack.defence_skill) / 100 + 0.1;
        if (dice < crit_chance)
            attack.flags.crit = true;
        const res = system_1.CharacterSystem.resistance(defender);
        attack.damage.subtract(res);
    }
    Attack.defend_against_melee = defend_against_melee;
    function dodge(attack, skill) {
        const skill_diff = skill - attack.attack_skill;
        if (skill_diff <= 0)
            return;
        attack.damage.mult(1 - skill_diff / 100);
    }
    Attack.dodge = dodge;
    function block(attack, skill) {
        // blocking is easier but harms weapon
        const skill_diff = (skill * 2 - attack.attack_skill);
        if (skill_diff <= 0)
            return;
        attack.damage.mult(1 - skill_diff / 100);
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
