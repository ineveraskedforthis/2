import { damage_type, melee_attack_type } from "../types";
import { DmgOps } from "../misc/damage_types";
import { Character } from "../character/character";
import { CharacterSystem } from "../character/system";
import { AttackObj } from "./class";

export namespace Attack {
    export function generate_melee(character: Character, type: damage_type): AttackObj {
        const result = new AttackObj(CharacterSystem.melee_weapon_type(character))
        DmgOps.add_ip(result.damage, CharacterSystem.melee_damage_raw(character, type))
        const physical_modifier = CharacterSystem.phys_power(character)
        DmgOps.mult_ip(result.damage, physical_modifier / 10)
        result.attack_skill = CharacterSystem.attack_skill(character)
        DmgOps.mult_ip(result.damage, 1 + result.attack_skill / 50)
        console.log(result)
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
        DmgOps.add_ip(result.damage, CharacterSystem.ranged_damage_raw(character))
        const skill = character.skills.ranged
        DmgOps.mult_ip(result.damage, 1 + skill / 20)
        return result
    }

    export function generate_magic_bolt(character: Character): AttackObj {
        const base_damage = 4
        const damage = Math.round(base_damage * CharacterSystem.magic_power(character) / 10 * (1 + character.skills.magic_mastery / 10))
        const result = new AttackObj('ranged')
        result.damage.fire = damage

        return result
    }

    export function defend_against_melee(attack: AttackObj, defender: Character) {
        const skill = Math.floor(CharacterSystem.attack_skill(defender) * (1 - defender.get_rage() / 100))
        attack.defence_skill = skill
        
        const dice = Math.random()
        const crit_chance = (attack.attack_skill - attack.defence_skill) / 100 + 0.1
        if (dice < crit_chance) attack.flags.crit = true

        const res = CharacterSystem.resistance(defender)
        DmgOps.subtract_ip(attack.damage, res)
    }

    export function dodge(attack: AttackObj, skill: number) {
        let skill_diff = skill - attack.attack_skill
        if (skill_diff <= 0) return
        if (skill_diff > 100) skill_diff = 100
        DmgOps.mult_ip(attack.damage, 1 - skill_diff / 100)
    }

    export function block(attack: AttackObj, skill: number) {
        // blocking is easier but harms weapon and can't block damage completely
        let skill_diff = (skill * 2 - attack.attack_skill)
        if (skill_diff <= 0) return
        if (skill_diff > 60) skill_diff = 60
        DmgOps.mult_ip(attack.damage, 1 - skill_diff / 100)
    }
}

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