import { textChangeRangeIsUnchanged } from "typescript"
import { affix } from "../base_game_classes/affix"
import type { Character } from "../base_game_classes/character/character"
import { AttackResult } from "../base_game_classes/misc/attack_result"
import type { DamageByTypeObject } from "../base_game_classes/misc/damage_types"
import { ARROW_BONE, material_index } from "../manager_classes/materials_manager"
import { World } from "../world"
import { WEAPON_TYPE } from "./type_script_types"


export type weapon_tag = 'polearms'|'onehand'|'ranged'|'twohanded'
export type equip_slot = 'body'|'legs'|'arms'|'head'|'foot'|'weapon'



export enum ARMOUR_TYPE {
    BODY,
    LEGS,
    ARMS,
    HEAD,
    FOOT,
}
export const armour_types: ARMOUR_TYPE[] = [ARMOUR_TYPE.ARMS, ARMOUR_TYPE.BODY, ARMOUR_TYPE.FOOT, ARMOUR_TYPE.HEAD, ARMOUR_TYPE.LEGS]

function protection_rating(x: ARMOUR_TYPE): number {
    switch(x) {
        case ARMOUR_TYPE.BODY: return 5;
        case ARMOUR_TYPE.LEGS: return 2;
        case ARMOUR_TYPE.ARMS: return 1;
        case ARMOUR_TYPE.HEAD: return 2;
        case ARMOUR_TYPE.FOOT: return 1;
    }    
}

export class ITEM_MATERIAL {
    density: number
    hardness: number
    string_tag: string
    constructor(density: number, hardness:number, string_tag: string) {
        this.density = density
        this.hardness = hardness
        this.string_tag = string_tag
    }
}

export const enum IMPACT_TYPE {
    POINT,
    EDGE,
    HEAD,
}

export const enum IMPACT_SIZE {
    SMALL = 1, // spear/knife like, 1 unit,
    MEDIUM = 2, // 2 units
    LARGE = 3, // long sword
}

export const enum SHAFT_LEGTH {
    HAND = 0, // 1 unit of material
    SHORT = 1, // 2 units, javelin/mace
    LONG = 2, // 3 units, something like long pike, imagine longsword edge on long shaft lmao
}


// quality shows how well impact part of something serves it's purpose:
// for example: edges
// at 100 whole damage will be converted to slice, 
// at 0 it will act just as fancy club 





//so how items will work
//all items have durability: characteristic of how long they will last
//i decided to not make them the same class to avoid being 

//armour will have base protection rating based on type
//quality makes them last longer
//material will decide what kind of protection 1 unit of protection rating gives

export interface ArmourConstructorArgument {
    durability: number; 
    material: ITEM_MATERIAL;
    type: ARMOUR_TYPE;
    quality: number
    affixes: affix[],

    item_type: 'armour'    
}

export class Armour {
    durability: number;
    material: ITEM_MATERIAL;
    type: ARMOUR_TYPE;
    quality: number;
    item_type: 'armour';
    affixes: affix[]

    constructor(data: ArmourConstructorArgument) {
        this.durability = data.durability
        this.material = data.material
        this.type = data.type
        this.quality = data.quality
        this.affixes = [...data.affixes]
        this.item_type = 'armour'
    }

    get_weight() {
        return this.material.density * protection_rating(this.type) 
    }

    get_json() {
        let data:ArmourConstructorArgument = {
            durability     : this.durability,
            material       : this.material,
            type           : this.type,
            quality        : this.quality,
            affixes        : this.affixes,
            item_type      : this.item_type
        }
        
        return data
    }

    get_tag() {
        let tag = this.material.string_tag

        switch(this.type) {
            case ARMOUR_TYPE.ARMS: return tag + '_gloves'
            case ARMOUR_TYPE.LEGS: return tag + '_pants'
            case ARMOUR_TYPE.BODY: return tag + '_armour'
            case ARMOUR_TYPE.HEAD: return tag + '_helmet'
            case ARMOUR_TYPE.FOOT: return tag + '_boots'
        }
    }
    get_data() {
        return {tag: this.get_tag(), affixes: this.affixes.length, affixes_list: this.affixes, item_type: this.item_type}
    }
}



// weapons will be kind of modular
// they will have two parts: handle and impact part
// both of them could have different materials, length and weight
// impact part can be enchanted
// weight of shaft matters less for edge and head attacks
// weight doesn't matter that much for point attacks

export interface WeaponConstructorArgument {
    durability: number,
    shaft_length: SHAFT_LEGTH,
    shaft_material: ITEM_MATERIAL,
    impact_size: IMPACT_SIZE, 
    impact_material: ITEM_MATERIAL, 
    impact_type: IMPACT_TYPE, 
    impact_quality: number,
    affixes: affix[],
    ranged?: boolean,
    item_type: 'weapon'
}


function shaft_length_to_number(x: SHAFT_LEGTH): number {
    switch(x) {
        case SHAFT_LEGTH.HAND: return       0.2
        case SHAFT_LEGTH.SHORT: return +    0.8
        case SHAFT_LEGTH.LONG: return +     2.0
    }
}

function impact_size_to_number(x: IMPACT_SIZE) {
    switch(x) {
        case IMPACT_SIZE.SMALL: return  0.3
        case IMPACT_SIZE.MEDIUM: return 1.0
        case IMPACT_SIZE.LARGE: return  1.5
    }
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

    ranged: boolean;

    affixes: affix[]

    item_type: 'weapon'


    constructor(data: WeaponConstructorArgument) {

        this.durability = data.durability;

        this.shaft_length = data.shaft_length
        this.shaft_material = data.shaft_material;
        this.shaft_weight = shaft_length_to_number(this.shaft_length) * this.shaft_material.density

        this.impact_size = data.impact_size;
        this.impact_material = data.impact_material;
        this.impact_type = data.impact_type;
        this.impact_quality = data.impact_quality;
        this.impact_weight = impact_size_to_number(this.impact_size) * this.impact_material.density

        this.affixes = [...data.affixes]

        if (data.ranged == true) {
            this.ranged = true
        } else {
            this.ranged = false
        }

        this.item_type = 'weapon'
    }

    get_weight() {
        return this.shaft_weight + this.impact_weight
    }

    get_length() {
        let length = 0
        return impact_size_to_number(this.impact_size) + shaft_length_to_number(this.shaft_length)
    }

    get_weapon_type():WEAPON_TYPE {
        switch(this.shaft_length) {
            case SHAFT_LEGTH.LONG: return WEAPON_TYPE.POLEARMS 
            case SHAFT_LEGTH.SHORT: return WEAPON_TYPE.POLEARMS
            case SHAFT_LEGTH.HAND: switch(this.impact_size) {
                case IMPACT_SIZE.SMALL: return WEAPON_TYPE.ONEHAND
                case IMPACT_SIZE.MEDIUM: return WEAPON_TYPE.ONEHAND
                case IMPACT_SIZE.LARGE: return WEAPON_TYPE.TWOHANDED
            }
        }
        return WEAPON_TYPE.NOWEAPON
    }

    get_json() {
        let data:WeaponConstructorArgument = {
            durability: this.durability,

            shaft_length: this.shaft_length,
            shaft_material: this.shaft_material,

            impact_size: this.impact_size,
            impact_material: this.impact_material,
            impact_type: this.impact_type,
            impact_quality: this.impact_quality,

            affixes: this.affixes,

            item_type: this.item_type,
            ranged: this.ranged
        }
        return data
    }

    get_tag(): string {
        let imp_type = this.impact_type
        if (this.ranged) {
            return 'bow'
        }
        switch (imp_type) {
            case IMPACT_TYPE.POINT: {
                if (this.impact_material.string_tag == 'rat_bone') return 'bone_spear'
                return 'spear'
            }
            case IMPACT_TYPE.HEAD : return 'mace'
            case IMPACT_TYPE.EDGE : return 'sword'
        }
    }

    get_data() {
        return {tag: this.get_tag(), affixes: this.affixes.length, affixes_list: this.affixes, item_type: this.item_type}
    }
}

export function base_resist(result: DamageByTypeObject, item: Armour) {
    let temp_protection = protection_rating(item.type)
    let temp_hardness = item.material.hardness
    result.blunt = result.blunt + temp_protection * temp_hardness
    result.slice = result.slice + temp_protection * temp_hardness * 2
    result.pierce = result.pierce + temp_protection * temp_hardness
    return result
}

export function ranged_base_damage(result: AttackResult, arrow_type: material_index){
    if (arrow_type == ARROW_BONE) {
        result.damage.pierce += 10
    }
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
            result.damage.pierce = 2 * effective_weight * item.impact_quality / 100
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
