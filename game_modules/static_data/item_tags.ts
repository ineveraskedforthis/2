import type { CharacterGenericPart } from "../base_game_classes/character_generic_part"
import type { AttackResult } from "../base_game_classes/misc/attack_result"
import type { DamageByTypeObject } from "../base_game_classes/misc/damage_types"

export type item_tag = 'sword'|'empty'|'fist'|'spear'|'mace'|'rat_leather_armour'|'rat_fur_cap'|'elodino_flesh_dress'|'graci_hair'|'rat_leather_leggins'|'rat_leather_gauntlets'|'rat_leather_boots'
export type affix_tag = 'sharp'|'heavy'|'hot'|'precise'|'power_battery'|'madness'|'calm'|'daemonic'|'notched'|'thick'|'hard'|'elodino_pleasure'|'power_of_graci_beauty'

export const item_base_damage = {
        sword: (result:AttackResult) => {
            result.damage = {blunt: 5, pierce: 10, slice: 20, fire: 0}
            return result
        },
        empty: (result:AttackResult) => {
            result.damage = {blunt: 3, pierce: 1, slice: 1, fire: 0}
            return result
        },
        fist: (result:AttackResult) => {
            result.damage = {blunt: 10, pierce: 1, slice: 1, fire: 0};
            return result
        },
        spear: (result:AttackResult) => {
            result.damage = {blunt: 5, pierce: 20, slice: 5, fire: 0}
            return result
        },
        mace: (result:AttackResult) => {
            result.damage = {blunt: 60, pierce: 0, slice: 0, fire: 0}
            return result
        },
    }


export const item_base_range = {
        sword: (range: number) => {
            range += 0;
            return range
        },
        empty: (range: number) => {
            range += 0;
            return range
        },
        fist: (range: number) => {
            range += 0;
            return range
        },
        spear: (range: number) => {
            range += 2;
            return range
        },
        mace: (range: number) => {
            range += 0;
            return range
        },
    }

export const item_base_resists = {
        empty: (resists: DamageByTypeObject) => {
            return resists
        },
        rat_leather_armour: (resists: DamageByTypeObject) => {
            resists.pierce += 3;
            resists.slice += 3;
            return resists;
        },
        rat_fur_cap: (resists: DamageByTypeObject) => {
            resists.pierce += 1;
            resists.slice += 1;
            return resists;
        },
        rat_leather_leggins: (resists: DamageByTypeObject) => {
            resists.pierce += 2;
            resists.slice += 2;
            return resists;
        },
        rat_leather_boots: (resists: DamageByTypeObject) => {
            resists.slice += 1;
            return resists;
        },
        rat_leather_gauntlets: (resists: DamageByTypeObject) => {
            resists.slice += 1;
            return resists;
        },
        elodino_flesh_dress: (resists: DamageByTypeObject) => {
            return resists;
        },
        graci_hair: (resists: DamageByTypeObject) => {
            resists.slice += 1;
            return resists;
        }
    }

export const damage_affixes_effects = {
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

export const protection_affixes_effects = {
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

export const get_power = {
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

export const update_character = {
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

export const slots = {
        sword: 'right_hand',
        spear: 'right_hand',
        mace: 'right_hand',
        rat_leather_armour: 'body',
        elodino_flesh_dress: 'body',
        rat_fur_cap: 'head',
        graci_hair: 'head',
        rat_leather_leggins: 'legs',
        rat_leather_gauntlets: 'arms',
        rat_leather_boots: 'foot'
    }

export const loot_chance_weight = {
        rat: {
            sword:                     30,
            spear:                     30,
            mace:                      30,
            rat_leather_armour:       100,
            rat_fur_cap:              100,
            rat_leather_leggins:      100,
            rat_leather_gauntlets:     50,
            rat_leather_boots:         50,
        },
        elodino: {
            sword: 300,
            spear: 300,
            mace: 300,
            elodino_flesh_dress: 100
        },
        graci: {
            sword: 100,
            spear: 100,
            mace: 100,
            graci_hair: 100,
        },
        test: {

        }
    }

type affix_weights = {[_ in item_tag]: {[_ in affix_tag]?: number}}

export const loot_affixes_weight: affix_weights = {
        sword: {
            sharp: 60,
            heavy: 100,
            hot: 30,
            precise: 50,
            power_battery: 10,
            madness: 20,
            calm: 10,
            daemonic: 1,
            notched: 60
        },
        spear: {
            heavy: 5,
            hot: 50,
            sharp: 50,
            power_battery: 50,
            precise: 50,
            calm: 10,
            daemonic: 1,
        },
        mace: {
            heavy: 150,
            hot: 50,
            precise: 50,
            power_battery: 50,
            madness: 50,
            daemonic: 1
        },
        rat_leather_armour: {
            thick: 2,
            power_battery: 1,
            hard: 1
        },
        rat_fur_cap: {
            thick: 2,
            power_battery: 1,
            hard: 1
        },
        elodino_flesh_dress: {
            power_battery: 10,
            elodino_pleasure: 2
        },
        graci_hair: {
            power_battery: 10,
            thick: 2,
            power_of_graci_beauty: 3,
        },
        rat_leather_leggins: {
            thick: 2,
            power_battery: 1
        },
        rat_leather_gauntlets: {
            thick: 2,
            power_battery: 2
        },
        rat_leather_boots: {
            thick: 2,
            power_battery: 1
        },
        empty: {

        },
        fist: {

        }
    }