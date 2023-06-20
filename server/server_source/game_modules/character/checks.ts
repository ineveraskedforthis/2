import { ARROW_BONE, ZAZ } from "../manager_classes/materials_manager";
import { weapon_attack_tag, WEAPON_TYPE } from "../types";
import { Item } from "../items/item";
import { Character } from "./character";

function weapon_type(weapon: Item | undefined): weapon_attack_tag {
    if (weapon == undefined) {
        return 'noweapon';
    }
    return weapon.weapon_tag;
}

export function can_dodge(character: Character): boolean {
    if (character.perks.advanced_unarmed == true) {
        if (weapon_type(character.equip.data.weapon) == 'noweapon') {
            return true;
        }
    }
    if (character.perks.dodge == true) {
        return true;
    }
    return false;
}

export function can_fast_attack(character: Character): boolean {
    if (character.perks.advanced_unarmed == true) {
        if (weapon_type(character.equip.data.weapon) == 'noweapon') {
            return true;
        }
    }
    return false;
}

export function can_push_back(character: Character): boolean {
    if (character.perks.advanced_polearm == true) {
        if (weapon_type(character.equip.data.weapon) == WEAPON_TYPE.POLEARMS) {
            return true;
        }
    }
    return false;
}

export function can_cast_magic_bolt(character: Character): boolean {
    return (character.perks.magic_bolt == true)
}

export function can_cast_magic_bolt_blood(character:Character): boolean {
    if (character.get_hp() + character.get_blood() + 1 < 10) {
        return false;
    }
    return (character.perks.magic_bolt == true) && (character.perks.blood_mage == true)
}

export function has_zaz(character: Character): boolean {
    return character.stash.get(ZAZ) > 0;
}

export function can_shoot(character: Character): boolean {
    if (character.equip.data.weapon == undefined) {
        return false;
    }
    if (character.equip.data.weapon.weapon_tag != 'ranged') {
        return false;
    }
    if (character.stash.get(ARROW_BONE) >= 1) {
        return true;
    }
    return false;
}
