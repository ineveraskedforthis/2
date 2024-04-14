"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.perk_requirement = void 0;
// import { Perks } from "./Perks";
function perk_requirement(tag, character) {
    switch (tag) {
        case 'meat_master': {
            if (character._skills.cooking < 15) {
                return 'not_enough_cooking_skill_15';
            }
            return 'ok';
        }
        case 'fletcher': {
            if (character._skills.woodwork < 15) {
                return 'not_enough_woodwork_skill_15';
            }
            return 'ok';
        }
        case 'advanced_unarmed': {
            if (character._skills.noweapon < 15) {
                return 'not_enough_unarmed_skill_15';
            }
            return 'ok';
        }
        case 'advanced_polearm': {
            if (character._skills.polearms < 15) {
                return 'not_enough_polearms_skill_15';
            }
            return 'ok';
        }
        case 'mage_initiation': {
            if (character._skills.magic_mastery < 15) {
                return 'not_enough_magic_skill_15';
            }
            return 'ok';
        }
        case 'magic_bolt': {
            if (!character._perks.mage_initiation) {
                return 'not_initiated';
            }
            if (character._skills.magic_mastery < 15) {
                return 'not_enough_magic_skill_15';
            }
            return 'ok';
        }
        case 'blood_mage': {
            if (!character._perks.mage_initiation) {
                return 'not_initiated';
            }
            if (character._skills.magic_mastery < 30) {
                return 'not_enough_magic_skill_30';
            }
            return 'ok';
        }
        case 'skin_armour_master': {
            if (character._skills.clothier < 15) {
                return 'not_enough_clothier_skill_15';
            }
            return 'ok';
        }
    }
}
exports.perk_requirement = perk_requirement;

