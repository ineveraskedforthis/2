"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.can_shoot = exports.has_zaz = exports.can_cast_magic_bolt_blood = exports.can_cast_magic_bolt = exports.can_dodge = void 0;
const character_1 = require("../scripted-values/character");
function can_dodge(character) {
    if (character_1.CharacterValues.perk(character, 16 /* PERK.BATTLE_DODGE */)) {
        return true;
    }
    return false;
}
exports.can_dodge = can_dodge;
function can_cast_magic_bolt(character) {
    return character_1.CharacterValues.perk(character, 14 /* PERK.MAGIC_BOLT */) == 1;
}
exports.can_cast_magic_bolt = can_cast_magic_bolt;
function can_cast_magic_bolt_blood(character) {
    if (character.get_hp() + character.get_blood() + 1 < 10) {
        return false;
    }
    return (character_1.CharacterValues.perk(character, 14 /* PERK.MAGIC_BOLT */) && character_1.CharacterValues.perk(character, 13 /* PERK.MAGIC_BLOOD */)) == 1;
}
exports.can_cast_magic_bolt_blood = can_cast_magic_bolt_blood;
function has_zaz(character) {
    return character.stash.get(30 /* MATERIAL.ZAZ */) > 0;
}
exports.has_zaz = has_zaz;
function can_shoot(character) {
    if (!character_1.CharacterValues.equiped_weapon_is_ranged(character)) {
        return false;
    }
    if (character.stash.get(character.equip.data.selected_ammo) >= 1) {
        return true;
    }
    return false;
}
exports.can_shoot = can_shoot;
