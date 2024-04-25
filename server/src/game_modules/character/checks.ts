import { MATERIAL, PERK } from "@content/content";
import { Character } from "../data/entities/character";
import { CharacterValues } from "../scripted-values/character";


export function can_dodge(character: Character): boolean {
    if (CharacterValues.perk(character, PERK.BATTLE_DODGE)) {
        return true;
    }
    return false;
}

export function can_cast_magic_bolt(character: Character): boolean {
    return CharacterValues.perk(character, PERK.MAGIC_BOLT) == 1
}

export function can_cast_magic_bolt_blood(character:Character): boolean {
    if (character.get_hp() + character.get_blood() + 1 < 10) {
        return false;
    }
    return (CharacterValues.perk(character, PERK.MAGIC_BOLT) && CharacterValues.perk(character, PERK.MAGIC_BLOOD)) == 1
}

export function has_zaz(character: Character): boolean {
    return character.stash.get(MATERIAL.ZAZ) > 0;
}

export function can_shoot(character: Character): boolean {
    if (!CharacterValues.equiped_weapon_is_ranged(character)) {
        return false;
    }
    if (character.stash.get(character.equip.data.selected_ammo) >= 1) {
        return true;
    }
    return false;
}
