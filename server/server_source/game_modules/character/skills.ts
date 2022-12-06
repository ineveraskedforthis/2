import { ARROW_BONE, ZAZ } from "../manager_classes/materials_manager";
import { money, weapon_attack_tag, WEAPON_TYPE } from "../types";
import { Item } from "../items/item";
import { Character } from "./character";
import { Data } from "../data";


export type Perks = 'meat_master'|'advanced_unarmed'|'advanced_polearm'|'mage_initiation'|'magic_bolt'|'fletcher'|'skin_armour_master'
export const perks_list:Perks[] = ['meat_master', 'advanced_unarmed', 'advanced_polearm', 'mage_initiation', 'magic_bolt', 'fletcher', 'skin_armour_master']
export interface PerksTable {
    meat_master?: boolean; //100% chance to prepare meat
    claws?: boolean; // + unarmed damage
    advanced_unarmed?:boolean; //allows unarmed dodge and fast attacks
    advanced_polearm?:boolean
    mage_initiation?:boolean
    magic_bolt?:boolean
    fletcher?:boolean
    skin_armour_master?:boolean
}

function perk_base_price(tag: Perks) {
    switch(tag) {
        case 'meat_master': return 100
        case 'advanced_unarmed': return 200
        case 'advanced_polearm': return 200
        case 'mage_initiation': return 1000
        case 'magic_bolt': return 100
        case 'fletcher': return 200
        case 'skin_armour_master': return 1000
    }
}

export function perk_price(tag: Perks, student: Character, teacher: Character):money {
    let price = perk_base_price(tag)
    
    if (Data.Reputation.a_X_b(teacher.id, 'enemy', student.id)) price = price * 10
    if (!Data.Reputation.a_X_b(teacher.id, 'friend', student.id)) price = price * 1.5
    if (!Data.Reputation.a_X_b(teacher.id, 'member', student.id)) price = price * 1.5

    return Math.round(price) as money
}

export function perk_requirement(tag:Perks, character: Character) {
    switch(tag) {
        case 'meat_master': {
            if (character.skills.cooking < 15) {
                return 'not_enough_cooking_skill_15'
            }
            return 'ok'
        }
        case 'fletcher' : {
            if (character.skills.woodwork < 15) {
                return 'not_enough_woodwork_skill_15'
            }
            return 'ok'
        }
        case 'advanced_unarmed': {
            if (character.skills.noweapon < 15) {
                return 'not_enough_unarmed_skill_15'
            }
            return 'ok'
        }
        case 'advanced_polearm': {
            if (character.skills.polearms < 15) {
                return 'not_enough_polearms_skill_15'
            }
            return 'ok'
        }
        case 'mage_initiation': {
            if (character.skills.magic_mastery < 15) {
                return 'not_enough_magic_skill_15'
            }
            return 'ok'
        }
        case 'magic_bolt': {
            if (!character.perks.mage_initiation) {
                return 'not_initiated'
            }
            if (character.skills.magic_mastery < 15) {
                return 'not_enough_magic_skill_15'
            }
            return 'ok'
        }
        case 'skin_armour_master': {
            if (character.skills.clothier < 15) {
                return 'not_enough_clothier_skill_15'
            }
        }
    }
}
function weapon_type(weapon: Item|undefined):weapon_attack_tag {
    if (weapon == undefined) {
        return 'noweapon'
    }
    return weapon.weapon_tag
}
export function can_dodge(character:Character):boolean {
    if (character.perks.advanced_unarmed == true) {
        if (weapon_type(character.equip.data.weapon) == 'noweapon') {
            return true
        }
    }
    return false
}

export function can_fast_attack(character:Character):boolean {
    if (character.perks.advanced_unarmed == true) {
        if (weapon_type(character.equip.data.weapon) == 'noweapon') {
            return true
        }
    }
    return false
}

export function can_push_back(character:Character):boolean {
    if (character.perks.advanced_polearm == true) {
        if (weapon_type(character.equip.data.weapon) == WEAPON_TYPE.POLEARMS) {
            return true
        }
    }
    return false
}

export function can_cast_magic_bolt(character: Character):boolean {
    if (character.perks.magic_bolt) {
        return true
    }
    if (character.stash.get(ZAZ) > 0) {
        return true
    }
    return false
}

export function can_shoot(character: Character): boolean {
    if (character.equip.data.weapon == undefined) {
        return false
    }
    if (character.equip.data.weapon.weapon_tag != 'ranged') {
        return false
    }
    if (character.stash.get(ARROW_BONE) >= 1) {
        return true
    }
    return false
}

export class SkillList {
    clothier: number;
    cooking: number;
    onehand: number;
    polearms: number;
    noweapon: number;
    twohanded: number
    skinning: number;
    magic_mastery: number;
    blocking: number;
    evasion: number;
    woodwork: number;
    hunt: number;
    ranged: number;
    bone_carving: number;


    constructor() {
        this.clothier       = 0;
        this.cooking        = 0;
        this.onehand        = 0;
        this.polearms       = 0;
        this.noweapon       = 0;
        this.twohanded      = 0;
        this.skinning       = 0;
        this.magic_mastery  = 0;
        this.blocking       = 0;
        this.evasion        = 0;
        this.woodwork       = 0;
        this.hunt           = 0;
        this.ranged         = 0;
        this.bone_carving   = 0
    }
}

export type skill = keyof SkillList