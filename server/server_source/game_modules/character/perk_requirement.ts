import { Perks } from "../../../../shared/character";
import { Character } from "./character";
// import { Perks } from "./Perks";

export function perk_requirement(tag: Perks, character: Character) {
    switch (tag) {
        case 'meat_master': {
            if (character.skills.cooking < 15) {
                return 'not_enough_cooking_skill_15';
            }
            return 'ok';
        }
        case 'fletcher': {
            if (character.skills.woodwork < 15) {
                return 'not_enough_woodwork_skill_15';
            }
            return 'ok';
        }
        case 'advanced_unarmed': {
            if (character.skills.noweapon < 15) {
                return 'not_enough_unarmed_skill_15';
            }
            return 'ok';
        }
        case 'advanced_polearm': {
            if (character.skills.polearms < 15) {
                return 'not_enough_polearms_skill_15';
            }
            return 'ok';
        }
        case 'mage_initiation': {
            if (character.skills.magic_mastery < 15) {
                return 'not_enough_magic_skill_15';
            }
            return 'ok';
        }
        case 'magic_bolt': {
            if (!character.perks.mage_initiation) {
                return 'not_initiated';
            }
            if (character.skills.magic_mastery < 15) {
                return 'not_enough_magic_skill_15';
            }
            return 'ok';
        }
        case 'blood_mage': {
            if (!character.perks.mage_initiation) {
                return 'not_initiated';
            }
            if (character.skills.magic_mastery < 30) {
                return 'not_enough_magic_skill_30';
            }
            return 'ok';
        }
        case 'skin_armour_master': {
            if (character.skills.clothier < 15) {
                return 'not_enough_clothier_skill_15';
            }
            return 'ok';
        }
    }
}
