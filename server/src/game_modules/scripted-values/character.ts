import { skill } from "@custom_types/inventory"
import { Data } from "../data/data_objects"
import { Character } from "../data/entities/character"
import { trim } from "../calculations/basic_functions"
import { is_melee_skill } from "../character/SkillList"
import { EquipmentValues } from "./equipment-values"
import { ItemSystem } from "../systems/items/item_system"
import { EQUIP_SLOT, IMPACT_TYPE } from "@content/content"
import { BaseResists } from "../races/resists"
import { DmgOps } from "../damage_types"
import { weapon_skill_tag } from "../client_communication/network_actions/updates"
import { BaseStats } from "../races/stats"
import { Perks } from "@custom_types/character"
import { Damage } from "../Damage"
import { melee_attack_type } from "@custom_types/common"

export namespace CharacterValues {
export function pure_skill(character: Character, skill: skill) {
        let result = character._skills[skill]
        if (result == undefined) {
            result = 0
        }
        return result
    }

    export function skill(character: Character, skill: skill) {
        let result = character._skills[skill]
        if (result == undefined) {
            result = 0
        }

        let location = Data.Locations.from_id(character.location_id)

        if (location.has_cooking_tools && skill == 'cooking') {
            result = (result + 5) * 1.2
        }

        if (location.has_bowmaking_tools && skill == 'woodwork') {
            result = (result + 5) * 1.2
        }

        if (location.has_clothier_tools && skill == 'clothier') {
            result = (result + 5) * 1.2
        }

        if (skill == 'ranged') {
            const rage_mod = (100 - character.get_rage()) / 100
            const stress_mod = (100 - character.get_stress()) / 100
            const fatigue_mod = (100 - character.get_fatigue()) / 100
            result = result * rage_mod * stress_mod * fatigue_mod
        }

        if (is_melee_skill(skill)) {
            const rage_mod = (100 - character.get_rage()) / 100
            const stress_mod = (100 - character.get_stress()) / 100
            const fatigue_mod = (100 - character.get_fatigue()) / 100
            result = result * rage_mod * stress_mod * fatigue_mod
        }

        return trim(Math.round(result), 0, 100)
    }

    export function range(character: Character) {
        let weapon = EquipmentValues.weapon(character.equip)

        if (weapon != undefined) {
            let result = ItemSystem.range(weapon)
            if (weapon.prototype.impact == IMPACT_TYPE.POINT) {
                if (character._perks.advanced_polearm) {
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
        if (weapon_damage != undefined) {
            if (character._perks.advanced_polearm) {
                if (equiped_weapon_impact_type(character) == IMPACT_TYPE.POINT) {
                    DmgOps.mult_ip(weapon_damage, 1.2)
                }
            }
            return weapon_damage
        }

        //handle case of unarmed
        const damage = new Damage()
        if (type == 'blunt')    {
            if (character._perks.advanced_unarmed) {damage.blunt = 40} else {damage.blunt = 15}
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
        base += skill(character, 'travelling') / 30
        base += skill(character, 'noweapon') / 50
        base += skill(character, 'fishing') / 50
        base += skill(character, 'ranged') / 60
        base += skill(character, 'woodwork') / 40
        base += (skill(character, 'onehand') + skill(character, 'polearms') + skill(character, 'twohanded')) / 50
        return Math.floor(base * EquipmentValues.phys_power_modifier(character.equip))
    }

    export function base_magic_power(character: Character) {
        return BaseStats[character.stats].magic_power
    }

    export function magic_power(character: Character) {
        let result = base_magic_power(character) + EquipmentValues.magic_power(character.equip)
        if (character._perks.mage_initiation) result += 5
        if (character._perks.magic_bolt) result += 3
        if (character._perks.blood_mage) {
            const blood_mod = character.status.blood / 50
            result = Math.round(result * (1 + blood_mod))
        }
        return result
    }

    export function perk(character: Character, tag: Perks) {
        return character._perks[tag] == true
    }

    export function enchant_rating(character: Character): number {
        let enchant_rating = magic_power(character) * (1 + skill(character, 'magic_mastery') / 100)
        // so it's ~15 at 50 magic mastery
        // and 1 at 20 magic mastery
        if (character._perks.mage_initiation) {
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
        duration = duration * (1 - skill(character, 'travelling') / 200)

        return duration
    }

    export function attack_skill(character: Character) {
        return skill(character, equiped_weapon_required_skill(character))
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

    export function equiped_weapon_required_skill_melee(character: Character):weapon_skill_tag {
        const weapon = EquipmentValues.weapon(character.equip)

        if (weapon == undefined) {
            return "noweapon"
        }

        if (weapon.prototype.impact == IMPACT_TYPE.POINT) {
            return "polearms"
        }

        if (ItemSystem.weight(weapon) > phys_power(character)) {
            return "twohanded"
        }

        return "onehand"
    }

    export function equiped_weapon_required_skill(character: Character):skill {
        const weapon = EquipmentValues.weapon(character.equip)

        if (weapon == undefined) {
            return "noweapon"
        }

        if (weapon.prototype.bow_power > 0) {
            return "ranged"
        }

        if (weapon.prototype.impact == IMPACT_TYPE.POINT) {
            return "polearms"
        }

        if (ItemSystem.weight(weapon) > phys_power(character)) {
            return "twohanded"
        }

        return "onehand"
    }
}