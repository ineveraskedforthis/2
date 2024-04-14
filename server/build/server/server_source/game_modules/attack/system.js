"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Attack = void 0;
const damage_types_1 = require("../damage_types");
const system_1 = require("../character/system");
const class_1 = require("./class");
var Attack;
(function (Attack) {
    function generate_melee(character, type) {
        const result = new class_1.AttackObj(system_1.CharacterSystem.equiped_weapon_required_skill_melee(character));
        //add base item damage
        damage_types_1.DmgOps.add_ip(result.damage, system_1.CharacterSystem.melee_damage_raw(character, type));
        //account for strength
        const physical_modifier = 1 + system_1.CharacterSystem.phys_power(character) / 30;
        damage_types_1.DmgOps.mult_ip(result.damage, physical_modifier);
        //account for character own skill
        result.attack_skill += system_1.CharacterSystem.attack_skill(character);
        //account for items modifiers
        // may change skill and everything
        character.equip.modify_attack(result);
        //modify base damage with skill
        damage_types_1.DmgOps.mult_ip(result.damage, 1 + result.attack_skill / 100);
        // console.log(result)
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
        //raw items damage
        damage_types_1.DmgOps.add_ip(result.damage, system_1.CharacterSystem.ranged_damage_raw(character));
        //account for strength
        const physical_modifier = system_1.CharacterSystem.phys_power(character);
        damage_types_1.DmgOps.mult_ip(result.damage, physical_modifier / 10);
        //account for items modifiers
        character.equip.modify_attack(result);
        //account for own skill
        const skill = system_1.CharacterSystem.skill(character, 'ranged');
        result.attack_skill += skill;
        //modify current damage with skill
        damage_types_1.DmgOps.mult_ip(result.damage, 1 + skill / 50);
        return result;
    }
    Attack.generate_ranged = generate_ranged;
    function magic_bolt_base_damage(character, charge_flag) {
        let base_damage = 15;
        if (charge_flag) {
            base_damage += 10;
        }
        const skill = system_1.CharacterSystem.skill(character, 'magic_mastery');
        return Math.round(base_damage * system_1.CharacterSystem.magic_power(character) / 10 * (1 + skill / 10));
    }
    Attack.magic_bolt_base_damage = magic_bolt_base_damage;
    function generate_magic_bolt(character, dist, charge_flag) {
        const result = new class_1.AttackObj('ranged');
        result.damage.fire = magic_bolt_base_damage(character, charge_flag);
        if (dist > 1) {
            result.damage.fire = Math.round(result.damage.fire / 7 + (result.damage.fire * 6 / 7) / dist);
        }
        return result;
    }
    Attack.generate_magic_bolt = generate_magic_bolt;
})(Attack = exports.Attack || (exports.Attack = {}));
