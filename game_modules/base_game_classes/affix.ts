import { Armour, IMPACT_TYPE, Weapon } from "../static_data/item_tags";
import { CharacterGenericPart } from "./character_generic_part";
import { AttackResult } from "./misc/attack_result";
import { DamageByTypeObject } from "./misc/damage_types";

export type affix_tag = 'sharp'|'heavy'|'hot'|'precise'|'of_power'|'of_madness'|'calm'|'daemonic'|'notched'|'thick'|'hard'|'of_elodino_pleasure'|'of_graci_beauty'|'of_elder_beast'|'of_protection'|'of_painful_protection'

export class affix{
    tag: affix_tag;
    tier: number;
    constructor(tag: affix_tag, tier: number) {
        this.tag = tag;
        this.tier = tier;
    }
}

export function get_potential_affix_weapon(enchant_rating:number, item:Weapon):{tag: affix_tag, weight: number}[] {
    let potential_affix:{tag: affix_tag, weight: number}[] = []
    potential_affix.push({tag: 'hot', weight: 1})
    potential_affix.push({tag: 'of_power', weight: 1})
    if ((item.impact_type == IMPACT_TYPE.POINT) || (item.impact_type == IMPACT_TYPE.EDGE)) {
        potential_affix.push({tag: 'sharp', weight: 20})
    }
    if ((item.impact_type == IMPACT_TYPE.EDGE)||(item.impact_type == IMPACT_TYPE.HEAD)){
        potential_affix.push({tag: 'sharp', weight: 10})
        potential_affix.push({tag: 'heavy', weight: 10})
        potential_affix.push({tag: 'notched', weight: 2})
    }

    potential_affix.push({tag: 'precise', weight: 5})

    if (enchant_rating > 20) {
        potential_affix.push({tag: 'daemonic', weight: 1})
        potential_affix.push({tag: 'of_madness', weight: 1})
    }
    return potential_affix
}

export function get_potential_affix_armour(enchant_rating:number, item:Armour):{tag: affix_tag, weight: number}[] {
    return [{tag: 'thick', weight: 10}, {tag: 'of_protection', weight: 1}]
}


export function enchant_item(enchant_rating: number, item: Weapon|Armour, potential_affix:{tag: affix_tag, weight: number}[]) {
    // enchant success
    let current_affixes = item.affixes.length
    let difficulty = current_affixes * current_affixes + 10
    let luck = Math.random()
    if (((luck + 1) * enchant_rating) < difficulty) {
        return 'fail'
    }

    //selection of the affix
    let total_weight = 0
    for (let aff of potential_affix) {
        total_weight += aff.weight
    }
    let rolled_position = Math.random() * total_weight

    let current_weight = 0
    for (let aff of potential_affix) {
        current_weight = current_weight + aff.weight
        if (current_weight >= rolled_position) {
            item.affixes.push(new affix(aff.tag, 1))
            return 'ok'
        }
    }
    return '???'
}

export function roll_affix_weapon(enchant_rating:number, item:Weapon) {
    let potential_affix = get_potential_affix_weapon(enchant_rating, item)
    return enchant_item(enchant_rating, item, potential_affix)
}

export function roll_affix_armour(enchant_rating:number, item:Armour) {
    let potential_affix = get_potential_affix_armour(enchant_rating, item)
    return enchant_item(enchant_rating, item, potential_affix)
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
        of_elodino_pleasure: dummy_attack_mod,
        hard: dummy_attack_mod,
        of_graci_beauty: dummy_attack_mod,
        of_painful_protection: dummy_attack_mod,
        of_elder_beast: dummy_attack_mod,
        of_protection: dummy_attack_mod,
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
        of_madness: (result: AttackResult, tier: number) => {
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
        of_power: (result: AttackResult, tier: number) => {
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
        of_madness: dummy_damage_mod,
        calm: dummy_damage_mod,
        thick: (resists: DamageByTypeObject, tier: number) => {
            resists.pierce += tier * 1;
            resists.slice += tier * 2;
            return resists;
        },

        of_power: dummy_damage_mod,

        hard: (resists: DamageByTypeObject, tier: number) => {
            resists.blunt += tier * 1;
            resists.pierce += tier * 1;
            resists.slice += tier * 1;
            return resists
        },

        of_elder_beast: (resists: DamageByTypeObject, tier: number) => {
            resists.blunt +=      2 * tier;
            resists.pierce +=     2 * tier;
            resists.slice +=      2 * tier;
            return resists
        },

        of_elodino_pleasure: (resists: DamageByTypeObject, tier: number) => {
            resists.blunt +=     -2 * tier;
            resists.pierce +=    -2 * tier;
            resists.slice +=     -2 * tier;
            resists.fire +=       -2 * tier;
            return resists
        },

        of_protection: (resists: DamageByTypeObject, tier: number) => {
            resists.blunt +=     +2 * tier;
            resists.pierce +=    +2 * tier;
            resists.slice +=     +2 * tier;
            resists.fire +=       +2 * tier;
            return resists
        },

        of_painful_protection: (resists: DamageByTypeObject, tier: number) => {
            resists.blunt +=     +5 * tier;
            resists.pierce +=    +5 * tier;
            resists.slice +=     +5 * tier;
            resists.fire +=       +5 * tier;
            return resists
        },

        of_graci_beauty: dummy_damage_mod,
    }

type power_modification = (data: number, tier: number) => number

export const get_power:{[_ in affix_tag]?: power_modification} = {
        of_power: (data: number, tier: number) => {
            data += tier * 2
            return data
        }, 
        of_elodino_pleasure: (data: number, tier: number) => {
            data += tier * 4
            return data
        },
        of_graci_beauty: (data: number, tier: number) => {
            data += tier * 2
            return data
        }
    }

type character_update_function = (agent: CharacterGenericPart, tier: number) => void

export const update_character:{[_ in affix_tag]?: character_update_function} = {
        of_elder_beast: (agent: CharacterGenericPart, tier: number) => {
            agent.change_stress(5 * tier);
            agent.change_rage(5 * tier);
            agent.change_hp(1 * tier);
        },

        of_graci_beauty: (agent: CharacterGenericPart, tier: number) => {
            agent.change_stress(1 * tier);
        },

        of_painful_protection: (agent: CharacterGenericPart, tier: number) => {
            agent.change_hp(-1 * tier);
        }
    }