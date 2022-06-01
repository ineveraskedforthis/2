import { textChangeRangeIsUnchanged } from "typescript"
import type { CharacterGenericPart } from "../base_game_classes/character_generic_part"
import type { AttackResult } from "../base_game_classes/misc/attack_result"
import type { DamageByTypeObject } from "../base_game_classes/misc/damage_types"

export type affix_tag = 'sharp'|'heavy'|'hot'|'precise'|'power_battery'|'madness'|'calm'|'daemonic'|'notched'|'thick'|'hard'|'elodino_pleasure'|'power_of_graci_beauty'

export enum ARMOUR_TYPE {
    BODY,
    LEGS,
    ARMS,
    HEAD,
    FOOT,
}

function protection_rating(x: ARMOUR_TYPE): number {
    switch(x) {
        case ARMOUR_TYPE.BODY: return 5;
        case ARMOUR_TYPE.LEGS: return 2;
        case ARMOUR_TYPE.ARMS: return 1;
        case ARMOUR_TYPE.HEAD: return 2;
        case ARMOUR_TYPE.FOOT: return 1;
    }    
}

const enum ITEM_MATERIAL {
    RAT_SKIN,
    BONE,
    ELODINO,
    GRACI_HAIR,
    WOOD,
    STEEL
}

function density (mat: ITEM_MATERIAL): number {
    switch(mat) {
        case ITEM_MATERIAL.RAT_SKIN: return 2;
        case ITEM_MATERIAL.BONE: return 3;
        case ITEM_MATERIAL.ELODINO: return 1;
        case ITEM_MATERIAL.GRACI_HAIR: return 2
        case ITEM_MATERIAL.WOOD: return 3
        case ITEM_MATERIAL.STEEL: return 20
    }
}

function hardness (mat: ITEM_MATERIAL): number {
    if (mat == ITEM_MATERIAL.RAT_SKIN) {
        return 4
    }
    if (mat == ITEM_MATERIAL.BONE) {
        return 10
    }
    if (mat == ITEM_MATERIAL.ELODINO) {
        return 1
    }
    if (mat == ITEM_MATERIAL.GRACI_HAIR) {
        return 2
    }
    if (mat == ITEM_MATERIAL.WOOD) {
        return 3
    }
    if (mat == ITEM_MATERIAL.STEEL) {
        return 20
    }
    return 1
}

const enum IMPACT_TYPE {
    POINT,
    EDGE,
    HEAD,
}

const enum IMPACT_SIZE {
    SMALL = 1, // spear/knife like, 1 unit,
    MEDIUM = 2, // 2 units
    LARGE = 3, // long sword
}

const enum SHAFT_LEGTH {
    HAND = 0, // 1 unit of material
    SHORT = 1, // 2 units, javelin/mace
    LONG = 2, // 3 units, something like long pike, imagine longsword edge on long shaft lmao
}


// quality shows how well impact part of something serves it's purpose:
// for example: edges
// at 100 whole damage will be converted to slice, 
// at 0 it will act just as fancy club 





export class affix{
    tag: affix_tag;
    tier: number;
    constructor(tag: affix_tag, tier: number) {
        this.tag = tag;
        this.tier = tier;
    }
}

//so how items will work
//all items have durability: characteristic of how long they will last
//i decided to not make them the same class to avoid being 

//armour will have base protection rating based on type
//quality makes them last longer
//material will decide what kind of protection 1 unit of protection rating gives

interface ArmourConstructorArgument {
    durability: number; 
    material: ITEM_MATERIAL;
    type: ARMOUR_TYPE;
    quality: number
    affixes: affix[]
}

export class Armour {
    durability: number;
    material: ITEM_MATERIAL;
    type: ARMOUR_TYPE;
    quality: number;

    affixes: affix[]

    constructor(data: ArmourConstructorArgument) {
        this.durability = data.durability
        this.material = data.material
        this.type = data.type
        this.quality = data.quality
        this.affixes = data.affixes
    }

    get_weight() {
        return density(this.material) * protection_rating(this.type) 
    }

    get_json() {
        let data:any = {}
        data.durability     = this.durability
        data.material       = this.material
        data.type           = this.type
        data.quality        = this.quality
        data.affixes        = this.affixes
        return data
    }
}



// weapons will be kind of modular
// they will have two parts: handle and impact part
// both of them could have different materials, length and weight
// impact part can be enchanted
// weight of shaft matters less for edge and head attacks
// weight doesn't matter that much for point attacks

interface WeaponConstructorArgument {
    durability: number,
    shaft_length: SHAFT_LEGTH,
    shaft_material: ITEM_MATERIAL, 
    shaft_weight: number,
    impact_size: IMPACT_SIZE, 
    impact_material: ITEM_MATERIAL, 
    impact_type: IMPACT_TYPE, 
    impact_quality: number,
    impact_weight: number
    affixes: affix[]
}


export class Weapon {
    durability: number;
    shaft_length: SHAFT_LEGTH;
    shaft_material: ITEM_MATERIAL;
    impact_size: number;
    impact_material: ITEM_MATERIAL;
    impact_type: IMPACT_TYPE;
    impact_quality: number;

    shaft_weight: number;
    impact_weight: number;

    affixes: affix[]


    constructor(data: WeaponConstructorArgument) {

        this.durability = data.durability;

        this.shaft_length = data.shaft_length
        this.shaft_material = data.shaft_material;
        this.shaft_weight = data.shaft_weight


        this.impact_size = data.impact_size;
        this.impact_material = data.impact_material;
        this.impact_type = data.impact_type;
        this.impact_quality = data.impact_quality;
        this.impact_weight = data.impact_weight

        this.affixes = data.affixes
    }

    get_weight() {
        return this.shaft_weight + this.impact_weight
    }

    get_length() {
        let length = 0
        switch(this.impact_size) {
            case IMPACT_SIZE.SMALL: length = length + 0.1
            case IMPACT_SIZE.MEDIUM: length = length + 1
            case IMPACT_SIZE.LARGE: length = length + 2
        }
        switch(this.shaft_length) {
            case SHAFT_LEGTH.HAND: length = length + 0.1
            case SHAFT_LEGTH.SHORT: length = length + 1
            case SHAFT_LEGTH.LONG: length = length + 2
        }
        return length
    }

    get_json() {
        let data:WeaponConstructorArgument = {
            durability: this.durability,

            shaft_length: this.shaft_length,
            shaft_material: this.shaft_material,
            shaft_weight: this.shaft_weight,


            impact_size: this.impact_size,
            impact_material: this.impact_material,
            impact_type: this.impact_type,
            impact_quality: this.impact_quality,
            impact_weight: this.impact_weight,

            affixes: this.affixes
        }
        return data
    }
}

export function base_resist(result: DamageByTypeObject, item: Armour) {
    let temp_protection = protection_rating(item.type)
    let temp_hardness = hardness(item.material)
    result.blunt = result.blunt + temp_protection * temp_hardness
    result.slice = result.slice + temp_protection * temp_hardness * 2
    result.pierce = result.pierce + temp_protection * temp_hardness
    return result
}

export function base_damage(result: AttackResult, item: Weapon) {
    switch(item.impact_type) {
        case IMPACT_TYPE.EDGE: {
            let effective_weight = (item.impact_weight * item.shaft_length + item.shaft_weight)
            result.damage.slice = effective_weight * item.impact_quality / 100
            result.damage.blunt = effective_weight * (100 - item.impact_quality) / 100
        }
        case IMPACT_TYPE.POINT: {
            let effective_weight = (item.impact_weight + item.shaft_weight)
            result.damage.pierce = effective_weight * item.impact_quality / 100
            result.damage.blunt = effective_weight * (100 - item.impact_quality) / 100
        }
        case IMPACT_TYPE.HEAD: {
            let effective_weight = (item.impact_weight * item.shaft_length + item.shaft_weight)
            result.damage.blunt = effective_weight;
        }
    }
    return result
}

// export const item_base_damage = {
//         sword: (result:AttackResult) => {
//             result.damage = {blunt: 5, pierce: 10, slice: 20, fire: 0}
//             return result
//         },
//         empty: (result:AttackResult) => {
//             result.damage = {blunt: 3, pierce: 1, slice: 1, fire: 0}
//             return result
//         },
//         fist: (result:AttackResult) => {
//             result.damage = {blunt: 10, pierce: 1, slice: 1, fire: 0};
//             return result
//         },
//         spear: (result:AttackResult) => {
//             result.damage = {blunt: 5, pierce: 20, slice: 5, fire: 0}
//             return result
//         },
//         mace: (result:AttackResult) => {
//             result.damage = {blunt: 60, pierce: 0, slice: 0, fire: 0}
//             return result
//         },
//     }

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