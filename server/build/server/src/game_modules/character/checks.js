"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.can_shoot = exports.has_zaz = exports.can_cast_magic_bolt_blood = exports.can_cast_magic_bolt = exports.can_push_back = exports.can_fast_attack = exports.can_dodge = void 0;
const character_1 = require("../scripted-values/character");
function can_dodge(character) {
    if (character_1.CharacterValues.perk(character, 'advanced_unarmed')) {
        if (character_1.CharacterValues.equiped_weapon_required_skill(character) == "noweapon") {
            return true;
        }
    }
    if (character_1.CharacterValues.perk(character, 'dodge')) {
        return true;
    }
    return false;
}
exports.can_dodge = can_dodge;
function can_fast_attack(character) {
    if (character_1.CharacterValues.perk(character, 'advanced_unarmed')) {
        if (character_1.CharacterValues.equiped_weapon_required_skill(character) == "noweapon") {
            return true;
        }
    }
    return false;
}
exports.can_fast_attack = can_fast_attack;
function can_push_back(character) {
    if (character_1.CharacterValues.perk(character, 'advanced_polearm')) {
        if (character_1.CharacterValues.equiped_weapon_required_skill(character) == "polearms") {
            return true;
        }
    }
    return false;
}
exports.can_push_back = can_push_back;
function can_cast_magic_bolt(character) {
    return character_1.CharacterValues.perk(character, 'magic_bolt');
}
exports.can_cast_magic_bolt = can_cast_magic_bolt;
function can_cast_magic_bolt_blood(character) {
    if (character.get_hp() + character.get_blood() + 1 < 10) {
        return false;
    }
    return character_1.CharacterValues.perk(character, 'magic_bolt') && character_1.CharacterValues.perk(character, 'blood_mage');
}
exports.can_cast_magic_bolt_blood = can_cast_magic_bolt_blood;
function has_zaz(character) {
    return character.stash.get(30 /* MATERIAL.ZAZ */) > 0;
}
exports.has_zaz = has_zaz;
function can_shoot(character) {
    if (character_1.CharacterValues.equiped_weapon_required_skill(character) != 'ranged') {
        return false;
    }
    if (character.stash.get(character.equip.data.selected_ammo) >= 1) {
        return true;
    }
    return false;
}
exports.can_shoot = can_shoot;
