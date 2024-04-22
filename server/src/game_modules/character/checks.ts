import { MATERIAL } from "@content/content";
import { Character } from "../data/entities/character";
import { CharacterValues } from "../scripted-values/character";


export function can_dodge(character: Character): boolean {
    if (CharacterValues.perk(character, 'advanced_unarmed')) {
        if (CharacterValues.equiped_weapon_required_skill(character) == "noweapon") {
            return true;
        }
    }
    if (CharacterValues.perk(character, 'dodge')) {
        return true;
    }
    return false;
}

export function can_fast_attack(character: Character): boolean {
    if (CharacterValues.perk(character, 'advanced_unarmed')) {
        if (CharacterValues.equiped_weapon_required_skill(character) == "noweapon") {
            return true;
        }
    }
    return false;
}

export function can_push_back(character: Character): boolean {
    if (CharacterValues.perk(character, 'advanced_polearm')) {
        if (CharacterValues.equiped_weapon_required_skill(character) == "polearms") {
            return true;
        }
    }
    return false;
}

export function can_cast_magic_bolt(character: Character): boolean {
    return CharacterValues.perk(character, 'magic_bolt')
}

export function can_cast_magic_bolt_blood(character:Character): boolean {
    if (character.get_hp() + character.get_blood() + 1 < 10) {
        return false;
    }
    return CharacterValues.perk(character, 'magic_bolt') && CharacterValues.perk(character, 'blood_mage')
}

export function has_zaz(character: Character): boolean {
    return character.stash.get(MATERIAL.ZAZ) > 0;
}

export function can_shoot(character: Character): boolean {
    if (CharacterValues.equiped_weapon_required_skill(character) != 'ranged') {
        return false;
    }
    if (character.stash.get(character.equip.data.selected_ammo) >= 1) {
        return true;
    }
    return false;
}
