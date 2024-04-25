import { Data } from "../data/data_objects"
import { Character } from "../data/entities/character"
import { trim } from "../calculations/basic_functions"
import { EquipmentValues } from "./equipment-values"
import { ItemSystem } from "../systems/items/item_system"
import { EQUIP_SLOT, IMPACT_TYPE, PERK, PerkConfiguration, PerkStorage, SKILL, SkillConfiguration, SkillStorage } from "@content/content"
import { BaseResists } from "../races/resists"
import { DmgOps } from "../damage_types"
import { BaseStats } from "../races/stats"
import { Damage } from "../Damage"
import { melee_attack_type } from "@custom_types/common"
import { Weapon } from "../data/entities/item"

export namespace CharacterValues {
export function pure_skill(character: Character, skill: SKILL) {
        let result = character._skills[skill]
        if (result == undefined) {
            result = 0
        }
        return result
    }

    export function skill(character: Character, skill: SKILL) {
        let result = character._skills[skill]
        if (result == undefined) {
            result = 0
        }

        let location = Data.Locations.from_id(character.location_id)

        if (location.has_cooking_tools && skill == SKILL.COOKING) {
            result = (result + 5) * 1.2
        }

        if (location.has_bowmaking_tools && skill == SKILL.WOODWORKING) {
            result = (result + 5) * 1.2
        }

        if (location.has_clothier_tools && skill == SKILL.CLOTHIER) {
            result = (result + 5) * 1.2
        }

        const rage_mod = (110 - character.get_rage()) / 100
        const stress_mod = (110 - character.get_stress()) / 100
        const fatigue_mod = (110 - character.get_fatigue()) / 100
        result = result * rage_mod * stress_mod * fatigue_mod

        return trim(Math.round(result), 0, 100)
    }

    export function range(character: Character) {
        let weapon = EquipmentValues.weapon(character.equip)

        if (weapon != undefined) {
            let result = ItemSystem.range(weapon)
            if (weapon.prototype.impact == IMPACT_TYPE.POINT) {
                if (character._perks[PERK.PRO_FIGHTER_POLEARMS]) {
                    result += 0.5
                }
            }
            return result
        }
        if (character.race == 'graci') return 2;
        if (character.model == 'bigrat') return 1
        if (character.model == 'elo') return 1
        return 0.5
    }



    export function melee_damage_raw(character: Character, type: melee_attack_type) {
        const weapon_damage = EquipmentValues.melee_damage(character.equip, type)
        const weapon = character.equip.weapon_id
        const weapon_data = Data.Items.from_id(weapon)
        if ((weapon_damage !== undefined) && (weapon_data !== undefined)) {
            for (const skill of ItemSystem.related_skils(weapon_data as Weapon, phys_power(character))) {
                if ((skill == SKILL.POLEARMS) && (character._perks[PERK.PRO_FIGHTER_POLEARMS])) {
                    if (equiped_weapon_impact_type(character) == IMPACT_TYPE.POINT) {
                        DmgOps.mult_ip(weapon_damage, 1.2)
                    }
                }
            }
            return weapon_damage
        }

        //handle case of unarmed
        const damage = new Damage()
        if (type == 'blunt')    {
            if (character._perks[PERK.PRO_FIGHTER_UNARMED]) {damage.blunt = 40} else {damage.blunt = 15}
        }
        if (type == 'slice')    {
            if (character._traits.claws) {damage.slice = 20} else {damage.slice = 2}
        }
        if (type == 'pierce')   {damage.pierce  = 0}
        return damage
    }

    export function ranged_damage_raw(character: Character) {
        const damage = EquipmentValues.ranged_damage(character.equip)
        if (damage != undefined) return damage
        return new Damage()
    }

    export function base_phys_power(character: Character) {
        return BaseStats[character.stats].phys_power
    }

    export function phys_power(character: Character) {
        let base = base_phys_power(character)
        for (const skill_id of SkillConfiguration.SKILL) {
            base += skill(character, skill_id) * SkillStorage.get(skill_id).strength_bonus / 100
        }
        return Math.floor(base * EquipmentValues.phys_power_modifier(character.equip))
    }

    export function base_magic_power(character: Character) {
        return BaseStats[character.stats].magic_power
    }

    export function magic_power(character: Character) {
        let result = base_magic_power(character) + EquipmentValues.magic_power(character.equip)

        for (const skill_id of SkillConfiguration.SKILL) {
            result += skill(character, skill_id) * SkillStorage.get(skill_id).magic_bonus / 100
        }

        for (const perk_id of PerkConfiguration.PERK) {
            result += perk(character, perk_id) * PerkStorage.get(perk_id).magic_bonus
        }

        if (perk(character, PERK.MAGIC_BLOOD)) {
            const blood_mod = character.status.blood / 50
            result = Math.round(result * (1 + blood_mod))
        }
        return result
    }

    export function perk(character: Character, tag: PERK): number {
        return character._perks[tag]
    }

    export function enchant_rating(character: Character): number {
        let enchant_rating =
            magic_power(character)
            * (1 + skill(character, SKILL.MAGIC) / 100)
            * (1 + skill(character, SKILL.ENCHANTING) / 50)
        // so it's ~15 at 50 magic mastery
        // and 1 at 20 magic mastery
        if (perk(character, PERK.MAGIC_INITIATION)) {
            enchant_rating = enchant_rating * 2
        }

        return enchant_rating
    }

    // TODO
    function weight(character: Character): number {
        return 1
    }

    function movement_speed_battle(character: Character): number {
        let speed = BaseStats[character.stats].movement_speed
        speed = speed * (2 - character.get_fatigue() / 100) * boots_speed_multiplier(character)

        return speed
    }

    export function movement_cost_battle(character: Character): number {
        return (2.5 / movement_speed_battle(character))
    }

    export function boots_speed_multiplier(character: Character): number {
        let base = 0.75

        const boots = EquipmentValues.item(character.equip, EQUIP_SLOT.BOOTS)

        if (boots != undefined) {
            base = base + boots.durability / 200
        }

        return base
    }

    export function movement_duration_map(character: Character): number {
        let duration = 1
        duration += character.get_fatigue() / 100
        duration = duration / boots_speed_multiplier(character)
        duration = duration * (1 - skill(character, SKILL.TRAVELLING) / 200)

        return duration
    }

    export function attack_skill(character: Character) {
        let max = 0
        const skills = equiped_weapon_required_skill(character)
        for (const skill_id of skills) {
            max = Math.max(max, skill(character, skill_id))
        }
        return max * (1 + 1 / skills.length)
    }

    export function resistance(character: Character) {
        let result = BaseResists[character.resists]
        result = DmgOps.add(result, EquipmentValues.resists(character.equip))
        return result
    }

    export function equiped_weapon_impact_type(character: Character):IMPACT_TYPE {
        const weapon = EquipmentValues.weapon(character.equip)
        if (weapon == undefined) {
            return IMPACT_TYPE.NONE;
        }
        return weapon.prototype.impact;
    }

    export function equiped_weapon_required_skill_melee(character: Character):SKILL[] {
        const weapon = EquipmentValues.weapon(character.equip)
        if (weapon == undefined) {
            return [SKILL.UNARMED]
        }
        return ItemSystem.related_skils(weapon, phys_power(character))
    }

    export function equiped_weapon_is_ranged(character: Character) : boolean {
        const weapon = EquipmentValues.weapon(character.equip)

        if (weapon == undefined) {
            return false
        }

        if (weapon.prototype.bow_power > 0) {
            return true
        }

        return false
    }

    export function equiped_weapon_required_skill(character: Character):SKILL[] {
        const weapon = EquipmentValues.weapon(character.equip)

        if (weapon == undefined) {
            return [SKILL.UNARMED]
        }

        if (weapon.prototype.bow_power > 0) {
            return [SKILL.RANGED]
        }

        return equiped_weapon_required_skill_melee(character)
    }
}