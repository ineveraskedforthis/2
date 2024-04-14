import { Weapon } from "../data/entities/item";
import { Character } from "./character";
import { CharacterSystem } from "./system";
import { IMPACT_TYPE, MATERIAL } from "@content/content";


export function can_dodge(character: Character): boolean {
    if (CharacterSystem.perk(character, 'advanced_unarmed')) {
        if (CharacterSystem.equiped_weapon_required_skill(character) == "noweapon") {
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
        if (CharacterSystem.equiped_weapon_required_skill(character) == "noweapon") {
            return true;
        }
    }
    return false;
}

export function can_push_back(character: Character): boolean {
    if (CharacterSystem.perk(character, 'advanced_polearm')) {
        if (CharacterSystem.equiped_weapon_required_skill(character) == "polearms") {
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
    return character.stash.get(MATERIAL.ZAZ) > 0;
}

export function can_shoot(character: Character): boolean {
    if (CharacterSystem.equiped_weapon_required_skill(character) != 'ranged') {
        return false;
    }
    if (character.stash.get(character.equip.data.selected_ammo) >= 1) {
        return true;
    }
    return false;
}
