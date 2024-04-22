"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharacterValues = void 0;
const data_objects_1 = require("../data/data_objects");
const basic_functions_1 = require("../calculations/basic_functions");
const SkillList_1 = require("../character/SkillList");
const equipment_values_1 = require("./equipment-values");
const item_system_1 = require("../systems/items/item_system");
const resists_1 = require("../races/resists");
const damage_types_1 = require("../damage_types");
const stats_1 = require("../races/stats");
const Damage_1 = require("../Damage");
var CharacterValues;
(function (CharacterValues) {
    function pure_skill(character, skill) {
        let result = character._skills[skill];
        if (result == undefined) {
            result = 0;
        }
        return result;
    }
    CharacterValues.pure_skill = pure_skill;
    function skill(character, skill) {
        let result = character._skills[skill];
        if (result == undefined) {
            result = 0;
        }
        let location = data_objects_1.Data.Locations.from_id(character.location_id);
        if (location.has_cooking_tools && skill == 'cooking') {
            result = (result + 5) * 1.2;
        }
        if (location.has_bowmaking_tools && skill == 'woodwork') {
            result = (result + 5) * 1.2;
        }
        if (location.has_clothier_tools && skill == 'clothier') {
            result = (result + 5) * 1.2;
        }
        if (skill == 'ranged') {
            const rage_mod = (100 - character.get_rage()) / 100;
            const stress_mod = (100 - character.get_stress()) / 100;
            const fatigue_mod = (100 - character.get_fatigue()) / 100;
            result = result * rage_mod * stress_mod * fatigue_mod;
        }
        if ((0, SkillList_1.is_melee_skill)(skill)) {
            const rage_mod = (100 - character.get_rage()) / 100;
            const stress_mod = (100 - character.get_stress()) / 100;
            const fatigue_mod = (100 - character.get_fatigue()) / 100;
            result = result * rage_mod * stress_mod * fatigue_mod;
        }
        return (0, basic_functions_1.trim)(Math.round(result), 0, 100);
    }
    CharacterValues.skill = skill;
    function range(character) {
        let weapon = equipment_values_1.EquipmentValues.weapon(character.equip);
        if (weapon != undefined) {
            let result = item_system_1.ItemSystem.range(weapon);
            if (weapon.prototype.impact == 0 /* IMPACT_TYPE.POINT */) {
                if (character._perks.advanced_polearm) {
                    result += 0.5;
                }
            }
            return result;
        }
        if (character.race == 'graci')
            return 2;
        if (character.model == 'bigrat')
            return 1;
        if (character.model == 'elo')
            return 1;
        return 0.5;
    }
    CharacterValues.range = range;
    function melee_damage_raw(character, type) {
        const weapon_damage = equipment_values_1.EquipmentValues.melee_damage(character.equip, type);
        if (weapon_damage != undefined) {
            if (character._perks.advanced_polearm) {
                if (equiped_weapon_impact_type(character) == 0 /* IMPACT_TYPE.POINT */) {
                    damage_types_1.DmgOps.mult_ip(weapon_damage, 1.2);
                }
            }
            return weapon_damage;
        }
        //handle case of unarmed
        const damage = new Damage_1.Damage();
        if (type == 'blunt') {
            if (character._perks.advanced_unarmed) {
                damage.blunt = 40;
            }
            else {
                damage.blunt = 15;
            }
        }
        if (type == 'slice') {
            if (character._traits.claws) {
                damage.slice = 20;
            }
            else {
                damage.slice = 2;
            }
        }
        if (type == 'pierce') {
            damage.pierce = 0;
        }
        return damage;
    }
    CharacterValues.melee_damage_raw = melee_damage_raw;
    function ranged_damage_raw(character) {
        const damage = equipment_values_1.EquipmentValues.ranged_damage(character.equip);
        if (damage != undefined)
            return damage;
        return new Damage_1.Damage();
    }
    CharacterValues.ranged_damage_raw = ranged_damage_raw;
    function base_phys_power(character) {
        return stats_1.BaseStats[character.stats].phys_power;
    }
    CharacterValues.base_phys_power = base_phys_power;
    function phys_power(character) {
        let base = base_phys_power(character);
        base += skill(character, 'travelling') / 30;
        base += skill(character, 'noweapon') / 50;
        base += skill(character, 'fishing') / 50;
        base += skill(character, 'ranged') / 60;
        base += skill(character, 'woodwork') / 40;
        base += (skill(character, 'onehand') + skill(character, 'polearms') + skill(character, 'twohanded')) / 50;
        return Math.floor(base * equipment_values_1.EquipmentValues.phys_power_modifier(character.equip));
    }
    CharacterValues.phys_power = phys_power;
    function base_magic_power(character) {
        return stats_1.BaseStats[character.stats].magic_power;
    }
    CharacterValues.base_magic_power = base_magic_power;
    function magic_power(character) {
        let result = base_magic_power(character) + equipment_values_1.EquipmentValues.magic_power(character.equip);
        if (character._perks.mage_initiation)
            result += 5;
        if (character._perks.magic_bolt)
            result += 3;
        if (character._perks.blood_mage) {
            const blood_mod = character.status.blood / 50;
            result = Math.round(result * (1 + blood_mod));
        }
        return result;
    }
    CharacterValues.magic_power = magic_power;
    function perk(character, tag) {
        return character._perks[tag] == true;
    }
    CharacterValues.perk = perk;
    function enchant_rating(character) {
        let enchant_rating = magic_power(character) * (1 + skill(character, 'magic_mastery') / 100);
        // so it's ~15 at 50 magic mastery
        // and 1 at 20 magic mastery
        if (character._perks.mage_initiation) {
            enchant_rating = enchant_rating * 2;
        }
        return enchant_rating;
    }
    CharacterValues.enchant_rating = enchant_rating;
    // TODO
    function weight(character) {
        return 1;
    }
    function movement_speed_battle(character) {
        let speed = stats_1.BaseStats[character.stats].movement_speed;
        speed = speed * (2 - character.get_fatigue() / 100) * boots_speed_multiplier(character);
        return speed;
    }
    function movement_cost_battle(character) {
        return (2.5 / movement_speed_battle(character));
    }
    CharacterValues.movement_cost_battle = movement_cost_battle;
    function boots_speed_multiplier(character) {
        let base = 0.75;
        const boots = equipment_values_1.EquipmentValues.item(character.equip, 8 /* EQUIP_SLOT.BOOTS */);
        if (boots != undefined) {
            base = base + boots.durability / 200;
        }
        return base;
    }
    CharacterValues.boots_speed_multiplier = boots_speed_multiplier;
    function movement_duration_map(character) {
        let duration = 1;
        duration += character.get_fatigue() / 100;
        duration = duration / boots_speed_multiplier(character);
        duration = duration * (1 - skill(character, 'travelling') / 200);
        return duration;
    }
    CharacterValues.movement_duration_map = movement_duration_map;
    function attack_skill(character) {
        return skill(character, equiped_weapon_required_skill(character));
    }
    CharacterValues.attack_skill = attack_skill;
    function resistance(character) {
        let result = resists_1.BaseResists[character.resists];
        result = damage_types_1.DmgOps.add(result, equipment_values_1.EquipmentValues.resists(character.equip));
        return result;
    }
    CharacterValues.resistance = resistance;
    function equiped_weapon_impact_type(character) {
        const weapon = equipment_values_1.EquipmentValues.weapon(character.equip);
        if (weapon == undefined) {
            return 3 /* IMPACT_TYPE.NONE */;
        }
        return weapon.prototype.impact;
    }
    CharacterValues.equiped_weapon_impact_type = equiped_weapon_impact_type;
    function equiped_weapon_required_skill_melee(character) {
        const weapon = equipment_values_1.EquipmentValues.weapon(character.equip);
        if (weapon == undefined) {
            return "noweapon";
        }
        if (weapon.prototype.impact == 0 /* IMPACT_TYPE.POINT */) {
            return "polearms";
        }
        if (item_system_1.ItemSystem.weight(weapon) > phys_power(character)) {
            return "twohanded";
        }
        return "onehand";
    }
    CharacterValues.equiped_weapon_required_skill_melee = equiped_weapon_required_skill_melee;
    function equiped_weapon_required_skill(character) {
        const weapon = equipment_values_1.EquipmentValues.weapon(character.equip);
        if (weapon == undefined) {
            return "noweapon";
        }
        if (weapon.prototype.bow_power > 0) {
            return "ranged";
        }
        if (weapon.prototype.impact == 0 /* IMPACT_TYPE.POINT */) {
            return "polearms";
        }
        if (item_system_1.ItemSystem.weight(weapon) > phys_power(character)) {
            return "twohanded";
        }
        return "onehand";
    }
    CharacterValues.equiped_weapon_required_skill = equiped_weapon_required_skill;
})(CharacterValues || (exports.CharacterValues = CharacterValues = {}));
