import { CharacterGenericPart } from "./character_generic_part";
import { AttackResult } from "./misc/attack_result";
import { DamageByTypeObject } from "./misc/damage_types";

export type affix_tag = 'sharp'|'heavy'|'hot'|'precise'|'power_battery'|'madness'|'calm'|'daemonic'|'notched'|'thick'|'hard'|'elodino_pleasure'|'power_of_graci_beauty'|'elder_beast_skin'|'protection'|'pain_shell'

export class affix{
    tag: affix_tag;
    tier: number;
    constructor(tag: affix_tag, tier: number) {
        this.tag = tag;
        this.tier = tier;
    }
}

type AttackModificationFunction = (result: AttackResult, tier: number) => AttackResult;
type DamageModificationFunction = (result: DamageByTypeObject, tier: number) => DamageByTypeObject;


function dummy_attack_mod(result: AttackResult, tier:number) {
    return result
}
function dummy_damage_mod(result: DamageByTypeObject, tier:number) {
    return result
}

export const damage_affixes_effects:{[_ in affix_tag]: AttackModificationFunction} = {
        thick: dummy_attack_mod,
        elodino_pleasure: dummy_attack_mod,
        hard: dummy_attack_mod,
        power_of_graci_beauty: dummy_attack_mod,
        pain_shell: dummy_attack_mod,
        elder_beast_skin: dummy_attack_mod,
        protection: dummy_attack_mod,
        sharp: (result: AttackResult, tier: number) => {
            result.damage.pierce += tier * 5;
            result.damage.slice += tier * 5
            return result
        },
        heavy: (result: AttackResult, tier: number) => {
            result.damage.blunt += tier * 5;
            return result
        },
        hot: (result: AttackResult, tier: number) => {
            result.damage.fire += tier * 10
            return result
        },
        precise: (result: AttackResult, tier: number) => {
            result.chance_to_hit += tier * 0.02
            return result
        },
        madness: (result: AttackResult, tier: number) => {
            result.damage.blunt +=  20 * tier;
            result.attacker_status_change.rage +=      2 * tier;
            return result
        },
        calm: (result: AttackResult, tier: number) => {
            result.attacker_status_change.rage +=     -1 * tier;
            return result
        },
        daemonic: (result: AttackResult, tier: number) => {
            result.damage.fire +=  300 * tier;
            result.attacker_status_change.stress+=   90;
            result.attacker_status_change.rage +=    100;
            return result
        },
        notched: (result: AttackResult, tier: number) => {
            result.damage.pierce +=  7 * tier;
            result.damage.slice +=   7 * tier;
            result.attacker_status_change.blood +=     2 * tier;
            return result
        },
        power_battery: (result: AttackResult, tier: number) => {
            result.damage.blunt += 1 * tier;
            return result
        }
    }



export const protection_affixes_effects:{[_ in affix_tag]: DamageModificationFunction} = {
        sharp: dummy_damage_mod,
        hot: dummy_damage_mod,
        notched: dummy_damage_mod,
        daemonic: dummy_damage_mod,
        heavy: dummy_damage_mod,
        precise: dummy_damage_mod,
        madness: dummy_damage_mod,
        calm: dummy_damage_mod,
        thick: (resists: DamageByTypeObject, tier: number) => {
            resists.pierce += tier * 1;
            resists.slice += tier * 2;
            return resists;
        },

        power_battery: (resists: DamageByTypeObject, tier: number) => {
            return resists
        },

        hard: (resists: DamageByTypeObject, tier: number) => {
            resists.blunt += tier * 1;
            resists.pierce += tier * 1;
            resists.slice += tier * 1;
            return resists
        },

        elder_beast_skin: (resists: DamageByTypeObject, tier: number) => {
            resists.blunt +=      2 * tier;
            resists.pierce +=     2 * tier;
            resists.slice +=      2 * tier;
            return resists
        },

        elodino_pleasure: (resists: DamageByTypeObject, tier: number) => {
            resists.blunt +=     -2 * tier;
            resists.pierce +=    -2 * tier;
            resists.slice +=     -2 * tier;
            resists.fire +=       -2 * tier;
            return resists
        },

        protection: (resists: DamageByTypeObject, tier: number) => {
            resists.blunt +=     +2 * tier;
            resists.pierce +=    +2 * tier;
            resists.slice +=     +2 * tier;
            resists.fire +=       +2 * tier;
            return resists
        },

        pain_shell: (resists: DamageByTypeObject, tier: number) => {
            resists.blunt +=     +5 * tier;
            resists.pierce +=    +5 * tier;
            resists.slice +=     +5 * tier;
            resists.fire +=       +5 * tier;
            return resists
        },

        power_of_graci_beauty: (resists: DamageByTypeObject, tier: number) => {
            return resists
        },
    }

type power_modification = (data: number, tier: number) => number

export const get_power:{[_ in affix_tag]?: power_modification} = {
        power_battery: (data: number, tier: number) => {
            data += tier
            return data
        }, 
        elodino_pleasure: (data: number, tier: number) => {
            data += tier * 2
            return data
        },
        power_of_graci_beauty: (data: number, tier: number) => {
            data += tier * 2
            return data
        }
    }

type character_update_function = (agent: CharacterGenericPart, tier: number) => void

export const update_character:{[_ in affix_tag]?: character_update_function} = {
        elder_beast_skin: (agent: CharacterGenericPart, tier: number) => {
            agent.change_stress(5 * tier);
            agent.change_rage(5 * tier);
            agent.change_hp(1 * tier);
        },

        power_of_graci_beauty: (agent: CharacterGenericPart, tier: number) => {
            agent.change_stress(1 * tier);
        },

        pain_shell: (agent: CharacterGenericPart, tier: number) => {
            agent.change_hp(-1 * tier);
        }
    }