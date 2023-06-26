import { ARROW_BONE, ZAZ } from "../manager_classes/materials_manager";
import { weapon_attack_tag, WEAPON_TYPE } from "../types";
import { Item } from "../items/item";
import { Character } from "./character";
import { CharacterSystem } from "./system";
import { ItemSystem } from "../items/system";

function weapon_type(weapon: Item | undefined): weapon_attack_tag {
    if (weapon == undefined) {
        return 'noweapon';
    }
    return ItemSystem.weapon_tag(weapon);
}

export function can_dodge(character: Character): boolean {
    if (CharacterSystem.perk(character, 'advanced_unarmed')) {
        if (weapon_type(character.equip.data.weapon) == 'noweapon') {
            return true;
        }
    }
    if (CharacterSystem.perk(character, 'dodge')) {
        return true;
    }
    return false;
}

export function can_fast_attack(character: Character): boolean {
    if (CharacterSystem.perk(character, 'advanced_unarmed')) {
        if (weapon_type(character.equip.data.weapon) == 'noweapon') {
            return true;
        }
    }
    return false;
}

export function can_push_back(character: Character): boolean {
    if (CharacterSystem.perk(character, 'advanced_polearm')) {
        if (weapon_type(character.equip.data.weapon) == WEAPON_TYPE.POLEARMS) {
            return true;
        }
    }
    return false;
}

export function can_cast_magic_bolt(character: Character): boolean {
    return CharacterSystem.perk(character, 'magic_bolt')
}

export function can_cast_magic_bolt_blood(character:Character): boolean {
    if (character.get_hp() + character.get_blood() + 1 < 10) {
        return false;
    }
    return CharacterSystem.perk(character, 'magic_bolt') && CharacterSystem.perk(character, 'blood_mage')
}

export function has_zaz(character: Character): boolean {
    return character.stash.get(ZAZ) > 0;
}

export function can_shoot(character: Character): boolean {
    if (CharacterSystem.weapon_type(character) != 'ranged') {
        return false;
    }
    if (character.stash.get(ARROW_BONE) >= 1) {
        return true;
    }
    return false;
}
