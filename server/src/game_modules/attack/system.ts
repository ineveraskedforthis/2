import { melee_attack_type } from "@custom_types/common";
import { DmgOps } from "../damage_types";
import { Character } from "../data/entities/character";
import { EquipmentEffects } from "../scripted-effects/equipment-effects";
import { CharacterValues } from "../scripted-values/character";
import { AttackObj } from "./class";
import { PERK, SKILL } from "@content/content";

export namespace Attack {
    export function generate_melee(character: Character, type: melee_attack_type): AttackObj {
        const result = new AttackObj(CharacterValues.equipped_weapon_required_skill_melee(character))
        //add base item damage
        DmgOps.add_ip(result.damage, CharacterValues.melee_damage_raw(character, type))
        //account for strength
        const physical_modifier = 1 + CharacterValues.phys_power(character) / 30
        DmgOps.mult_ip(result.damage, physical_modifier)

        // general fighting skill
        result.attack_skill += CharacterValues.skill(character, SKILL.FIGHTING)

        //account for character own skill
        result.attack_skill += CharacterValues.attack_skill(character)

        //account for items modifiers
        // may change skill and everything
        EquipmentEffects.modify_attack(character.equip, result)

        //modify base damage with skill
        DmgOps.mult_ip(result.damage, 1 + result.attack_skill / 100)
        // console.log(result)

        return result
    }

    export function best_melee_damage_type(character: Character):melee_attack_type {
        const damage_slice = DmgOps.total(CharacterValues.melee_damage_raw(character, 'slice'))
        const damage_blunt = DmgOps.total(CharacterValues.melee_damage_raw(character, 'blunt'))
        const damage_pierce = DmgOps.total(CharacterValues.melee_damage_raw(character, 'pierce'))

        const max = Math.max(damage_blunt, damage_pierce, damage_slice)

        if (damage_slice == max) return 'slice'
        if (damage_pierce == max) return 'pierce'
        if (damage_blunt == max) return 'blunt'

        return 'blunt'
    }

    export function generate_ranged(character: Character): AttackObj {
        const result = new AttackObj([SKILL.RANGED])
        //raw items damage
        DmgOps.add_ip(result.damage, CharacterValues.ranged_damage_raw(character))
        //account for strength
        const physical_modifier = CharacterValues.phys_power(character)
        DmgOps.mult_ip(result.damage, physical_modifier / 10)
        //account for items modifiers
        EquipmentEffects.modify_attack(character.equip, result)

        //account for own skill
        const skill = CharacterValues.skill(character, SKILL.RANGED)

        result.attack_skill += skill

        //modify current damage with skill
        DmgOps.mult_ip(result.damage, 1 + skill / 50)
        return result
    }

    export function magic_bolt_base_damage(character: Character, charge_flag: boolean): number {
        let base_damage = 1
        if (charge_flag) {
            base_damage += 2
        }
        if (CharacterValues.perk(character, PERK.MAGIC_BOLT)) (
            base_damage += 2
        )
        const skill = CharacterValues.skill(character, SKILL.BATTLE_MAGIC)
        return Math.round(base_damage * CharacterValues.magic_power(character) / 10 * (1 + skill / 10))
    }

    export function generate_magic_bolt(character: Character, dist: number, charge_flag: boolean): AttackObj {
        const result = new AttackObj([SKILL.BATTLE_MAGIC])
        result.damage.fire = magic_bolt_base_damage(character, charge_flag)

        if (dist > 1) {
            result.damage.fire = Math.round(result.damage.fire / 3 + (result.damage.fire * 2 / 3) / dist)
        }

        return result
    }
}