import { damage_type, melee_attack_type } from "../types";
import { DmgOps } from "../damage_types";
import { Character } from "../character/character";
import { CharacterSystem } from "../character/system";
import { AttackObj } from "./class";

export namespace Attack {
    export function generate_melee(character: Character, type: damage_type): AttackObj {
        const result = new AttackObj(CharacterSystem.melee_weapon_type(character))
        //add base item damage
        DmgOps.add_ip(result.damage, CharacterSystem.melee_damage_raw(character, type))
        //account for strength
        const physical_modifier = 1 + CharacterSystem.phys_power(character) / 30
        DmgOps.mult_ip(result.damage, physical_modifier)

        //account for character own skill
        result.attack_skill += CharacterSystem.attack_skill(character)

        //account for items modifiers
        // may change skill and everything
        character.equip.modify_attack(result)

        //modify base damage with skill
        DmgOps.mult_ip(result.damage, 1 + result.attack_skill / 100)
        // console.log(result)

        return result
    }

    export function best_melee_damage_type(character: Character):melee_attack_type {
        const damage_slice = DmgOps.total(CharacterSystem.melee_damage_raw(character, 'slice'))
        const damage_blunt = DmgOps.total(CharacterSystem.melee_damage_raw(character, 'blunt'))
        const damage_pierce = DmgOps.total(CharacterSystem.melee_damage_raw(character, 'pierce'))

        const max = Math.max(damage_blunt, damage_pierce, damage_slice)
        
        if (damage_slice == max) return 'slice'
        if (damage_pierce == max) return 'pierce'
        if (damage_blunt == max) return 'blunt'

        return 'blunt'
    }

    export function generate_ranged(character: Character): AttackObj {
        const result = new AttackObj('ranged')
        //raw items damage
        DmgOps.add_ip(result.damage, CharacterSystem.ranged_damage_raw(character))

        //account for strength
        const physical_modifier = CharacterSystem.phys_power(character)
        DmgOps.mult_ip(result.damage, physical_modifier / 10)

        //account for items modifiers
        character.equip.modify_attack(result)

        //account for own skill
        const skill = CharacterSystem.skill(character, 'ranged')
        
        result.attack_skill += skill

        //modify current damage with skill
        DmgOps.mult_ip(result.damage, 1 + skill / 20)
        return result
    }

    export function magic_bolt_base_damage(character: Character): number {
        const base_damage = 10
        const skill = CharacterSystem.skill(character, 'magic_mastery')
        return Math.round(base_damage * CharacterSystem.magic_power(character) / 10 * (1 + skill / 10))
    }   

    export function generate_magic_bolt(character: Character, dist: number): AttackObj {
        const result = new AttackObj('ranged')
        result.damage.fire = magic_bolt_base_damage(character)
        if (dist > 1) {
            result.damage.fire = Math.round(result.damage.fire / 7 + (result.damage.fire * 6 / 7) / dist)
        }

        return result
    }
}