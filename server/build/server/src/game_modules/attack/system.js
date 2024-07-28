"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Attack = void 0;
const damage_types_1 = require("../damage_types");
const equipment_effects_1 = require("../scripted-effects/equipment-effects");
const character_1 = require("../scripted-values/character");
const class_1 = require("./class");
var Attack;
(function (Attack) {
    function generate_melee(character, type) {
        const result = new class_1.AttackObj(character_1.CharacterValues.equipped_weapon_required_skill_melee(character));
        //add base item damage
        damage_types_1.DmgOps.add_ip(result.damage, character_1.CharacterValues.melee_damage_raw(character, type));
        //account for strength
        const physical_modifier = 1 + character_1.CharacterValues.phys_power(character) / 30;
        damage_types_1.DmgOps.mult_ip(result.damage, physical_modifier);
        // general fighting skill
        result.attack_skill += character_1.CharacterValues.skill(character, 25 /* SKILL.FIGHTING */);
        //account for character own skill
        result.attack_skill += character_1.CharacterValues.attack_skill(character);
        //account for items modifiers
        // may change skill and everything
        equipment_effects_1.EquipmentEffects.modify_attack(character.equip, result);
        //modify base damage with skill
        damage_types_1.DmgOps.mult_ip(result.damage, 1 + result.attack_skill / 100);
        // console.log(result)
        return result;
    }
    Attack.generate_melee = generate_melee;
    function best_melee_damage_type(character) {
        const damage_slice = damage_types_1.DmgOps.total(character_1.CharacterValues.melee_damage_raw(character, 'slice'));
        const damage_blunt = damage_types_1.DmgOps.total(character_1.CharacterValues.melee_damage_raw(character, 'blunt'));
        const damage_pierce = damage_types_1.DmgOps.total(character_1.CharacterValues.melee_damage_raw(character, 'pierce'));
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
        const result = new class_1.AttackObj([18 /* SKILL.RANGED */]);
        //raw items damage
        damage_types_1.DmgOps.add_ip(result.damage, character_1.CharacterValues.ranged_damage_raw(character));
        //account for strength
        const physical_modifier = character_1.CharacterValues.phys_power(character);
        damage_types_1.DmgOps.mult_ip(result.damage, physical_modifier / 10);
        //account for items modifiers
        equipment_effects_1.EquipmentEffects.modify_attack(character.equip, result);
        //account for own skill
        const skill = character_1.CharacterValues.skill(character, 18 /* SKILL.RANGED */);
        result.attack_skill += skill;
        //modify current damage with skill
        damage_types_1.DmgOps.mult_ip(result.damage, 1 + skill / 50);
        return result;
    }
    Attack.generate_ranged = generate_ranged;
    function magic_bolt_base_damage(character, charge_flag) {
        let base_damage = 1;
        if (charge_flag) {
            base_damage += 2;
        }
        if (character_1.CharacterValues.perk(character, 14 /* PERK.MAGIC_BOLT */))
            (base_damage += 2);
        const skill = character_1.CharacterValues.skill(character, 29 /* SKILL.BATTLE_MAGIC */);
        return Math.round(base_damage * character_1.CharacterValues.magic_power(character) / 10 * (1 + skill / 10));
    }
    Attack.magic_bolt_base_damage = magic_bolt_base_damage;
    function generate_magic_bolt(character, dist, charge_flag) {
        const result = new class_1.AttackObj([29 /* SKILL.BATTLE_MAGIC */]);
        result.damage.fire = magic_bolt_base_damage(character, charge_flag);
        if (dist > 1) {
            result.damage.fire = Math.round(result.damage.fire / 3 + (result.damage.fire * 2 / 3) / dist);
        }
        return result;
    }
    Attack.generate_magic_bolt = generate_magic_bolt;
})(Attack || (exports.Attack = Attack = {}));
